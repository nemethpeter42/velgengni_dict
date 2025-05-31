import { parentPort as parentPortUnchecked, workerData } from 'worker_threads';
import { readFileSync } from 'fs';
const BACKEND_RESULT_LIMIT = 20000; //10000;
const db = readFileSync(workerData.filename).
    toString().
    split("\n").
    filter(e => e.trim() !== '').
    map(e => ({ original: e.split('\t')[0].trim(), translated: e.split('\t')[1].trim() }));
console.log('thread for ' + workerData.sourceLang + ' <-> ' + workerData.targetLang + ' ready');
//null-check
if (parentPortUnchecked === null) {
    throw new Error(`parentPort is null`);
}
const parentPort = parentPortUnchecked;
parentPort.postMessage({ threadStartStatus: 'ready' });
//TODO egyelore csak bohockodik
parentPort.on('message', (q) => {
    let filteredEntries = db;
    //console.log(q)
    // hossz szerint csokkeno sorrendben rendezes
    //(ES logikat feltetelez ha regex-et csinalnal, feltetlenul vedd ki) 
    // => ez valoszinuleg soha nem fog megtortenni 
    q.conditions = q.conditions.sort((a, b) => b.expression.length - a.expression.length);
    for (const searchCondition of q.conditions) {
        searchCondition.expression = searchCondition.expression.trim();
        let genExpression;
        if (searchCondition.onlyWithSpaceDotOrCommaSuffix) {
            genExpression = [`${searchCondition.expression} `, `${searchCondition.expression}.`, `${searchCondition.expression},`];
        }
        else {
            genExpression = [searchCondition.expression];
        }
        let swapFirstCharCase = (e) => (e.charAt(0).toLowerCase() === e.charAt(0) ?
            e.charAt(0).toUpperCase() :
            e.charAt(0).toLowerCase()) + e.substring(1);
        genExpression = genExpression.concat(genExpression.map((e) => swapFirstCharCase(e)));
        if (searchCondition.onlyWithSpacePrefix) {
            genExpression = genExpression.map(e => ' ' + e);
        }
        console.log(genExpression);
        console.log(filteredEntries[0]);
        filteredEntries = filteredEntries.filter(e => {
            return genExpression.some(ph => {
                let subtitleStr = q.searchInTargetLanguage === true ? e.translated : e.original;
                //console.log(e)
                //console.log(typeof q.searchInTargetLanguage)
                //console.log(subtitleStr)
                if (subtitleStr.includes(ph)) {
                    //console.log('bingó')
                    return true;
                }
            });
        });
        console.log(filteredEntries.length);
    }
    filteredEntries = filteredEntries.slice(0, BACKEND_RESULT_LIMIT);
    console.log(JSON.stringify(q));
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
