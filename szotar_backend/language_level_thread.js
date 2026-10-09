import { parentPort as parentPortUnchecked, workerData } from 'worker_threads';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { getPatternForSearchCondition } from 'szotar_common/helpers/getPatternForSearchCondition.js';
import { swapFirstCharCase } from 'szotar_common/helpers/swapFirstCharCase.js';
const BACKEND_RESULT_LIMIT = 20000; //10000;
const readLines = (filename) => createInterface({
    input: createReadStream(filename, { encoding: 'utf8' }),
    crlfDelay: Infinity,
});
const db = [];
let lineIdx = 0;
for await (const line of readLines(workerData.filename)) {
    if (line.trim() === '') {
        continue;
    }
    if (lineIdx >= workerData.lastLineToKeepExclusive) {
        break;
    }
    if (lineIdx >= workerData.firstLineToKeep) {
        db.push({ original: line.split('\t')[0].trim(), translated: line.split('\t')[1].trim() });
    }
    lineIdx++;
}
console.log('thread #' + workerData.threadNumber + ' for ' + workerData.sourceLang + ' <-> ' + workerData.targetLang + ' ready');
//null-check
if (parentPortUnchecked === null) {
    throw new Error(`parentPort is null`);
}
const parentPort = parentPortUnchecked;
parentPort.postMessage({ threadStartStatus: 'ready' });
parentPort.on('message', (q) => {
    let filteredEntries = db;
    // hossz szerint csokkeno sorrendben rendezes
    //(ES logikat feltetelez ha regex-et csinalnal, feltetlenul vedd ki) 
    // => ez valoszinuleg soha nem fog megtortenni 
    q.conditions = q.conditions.sort((a, b) => b.expression.length - a.expression.length);
    for (const searchCondition of q.conditions) {
        searchCondition.expression = searchCondition.expression.trim();
        //TODO throw it out when the new regex format is considered safe enough
        let genExpression;
        if (searchCondition.onlyWithSpaceDotOrCommaSuffix) {
            genExpression = [`${searchCondition.expression} `, `${searchCondition.expression}.`, `${searchCondition.expression},`];
        }
        else {
            genExpression = [searchCondition.expression];
        }
        genExpression = genExpression.concat(genExpression.map((e) => swapFirstCharCase(e)));
        if (searchCondition.onlyWithSpacePrefix) {
            genExpression = genExpression.flatMap(e => [` ${e}`, `¿${e}`, `¡${e}`, `'${e}`]);
        }
        const searchRegex = new RegExp(getPatternForSearchCondition(searchCondition), 'gi');
        filteredEntries = filteredEntries.filter(e => {
            let subtitleStr = q.searchInTargetLanguage === true ? e.translated : e.original;
            return searchRegex.test(subtitleStr);
        });
    }
    filteredEntries = filteredEntries.slice(0, BACKEND_RESULT_LIMIT);
    const threadResMessage = {
        requestType: q.requestType,
        requestId: q.requestId,
        resultData: {
            entries: (q.reverseFieldOrder ?
                filteredEntries.map(e => ({ original: e.translated, translated: e.original })) :
                filteredEntries),
            backendResultLimit: BACKEND_RESULT_LIMIT,
        }
    };
    parentPort.postMessage(threadResMessage);
});
