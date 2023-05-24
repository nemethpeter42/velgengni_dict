import { Worker } from 'worker_threads';
import * as uuid from "uuid";
import XLSX from 'xlsx';
import * as vm from 'node:vm';
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import * as fsPromises from 'fs/promises';
import path from 'path';
import { flattenTwoDimArray } from '../libs/szotar_common/src/helpers/flattenTwoDimArray.js';
import { DictDescription } from '../libs/szotar_common/src/models/DictDescription.js';
const __dirname = path.resolve();
XLSX.set_fs(fsPromises);
const exampleSourceFiles = {
    //target language
    'hu': {
        //source language
        'de': {
            filename: 'example_source_dbs/de_hu.txt',
        },
        'es': {
            filename: 'example_source_dbs/es_hu.txt',
        },
    },
};
const app = express();
app.use(cors());
app.use(express.json());
const portNum = process.env.PORT || 3035;
app.set(`port`, portNum);
let wordList = fs.
    readFileSync(`word_list.txt`).
    //readFileSync(`word_list_nemet_ideigl.txt`).
    toString().
    split(`\n`).
    map(e => e.trim()).
    filter(e => e !== ``).
    map(e => e.split(`\t`).
    map(e2 => e2.trim()).
    filter(e2 => e2 !== ``));
const DICTS_FOLDER = `./dicts`;
const descFilenames = fs.readdirSync(DICTS_FOLDER, { withFileTypes: true })
    .filter(item => !item.isDirectory() && item.name.endsWith(`.desc.json`))
    .map(item => item.name);
console.log(descFilenames);
const dicts = {};
const startExampleDbThreadsAndReadDicts = async () => {
    const promises = [
        //load example-pair db files
        ...flattenTwoDimArray(Object.keys(exampleSourceFiles).map(targetLang => {
            return Object.keys(exampleSourceFiles[targetLang]).map(sourceLang => {
                return new Promise((resolve, reject) => {
                    try {
                        exampleSourceFiles[targetLang][sourceLang].workerThread = new Worker(`./language_level_thread.js`, { workerData: {
                                sourceLang: sourceLang,
                                targetLang: targetLang,
                                filename: exampleSourceFiles[targetLang][sourceLang].filename,
                                requestType: `START_WORKER`
                            } });
                        const workerThread = exampleSourceFiles[targetLang][sourceLang].workerThread;
                        workerThread.once(`message`, (message) => {
                            exampleSourceFiles[targetLang][sourceLang].workerStarted = true;
                            console.log(message);
                            resolve();
                        });
                    }
                    catch (error) {
                        console.log(`Error while loading thread "${sourceLang}"->"${targetLang}". Details: ${error}`);
                        reject(error);
                    }
                });
            });
        })),
        descFilenames.map(descFilename => {
            const fn = async () => {
                const dictName = descFilename.replaceAll(/\.desc\.json$/gi, ``);
                try {
                    console.log(`reading dictionary: "${dictName}"`);
                    const descFileRawContent = await fsPromises.readFile(`${DICTS_FOLDER}/${descFilename}`, { encoding: `utf8`, });
                    const buffer = await fsPromises.readFile(`${DICTS_FOLDER}/${dictName}.ods`);
                    const workbook = XLSX.read(buffer);
                    const sheetName = workbook.SheetNames[0];
                    const main = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: true, defval: ``, });
                    const meta = DictDescription.fromJson(descFileRawContent); // JSON.parse(descFileRawContent) as DictDescription
                    if (main[0]) {
                        const colsInDict = Object.keys(main[0]);
                        for (const col of colsInDict) {
                            if (!Object.keys(meta.cols).includes(col)) {
                                meta.cols[col] = {
                                    tailwindClasses: ``,
                                };
                            }
                        }
                    }
                    dicts[dictName] = { main, meta, };
                    console.log(`reading dictionary "${dictName}" finished`);
                }
                catch (error) {
                    console.log(`Error while reading dictionary "${dictName}"`);
                    throw (error);
                }
            };
            return fn();
        }),
    ];
    //console.log(promises)
    await Promise.all(promises);
    console.log(`all threads ready`);
};
(startExampleDbThreadsAndReadDicts()).then(() => {
    console.log(`listening on port: ${portNum}`);
    app.listen(app.get(`port`));
});
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/opensubtitles_db_szokereso_frontend.html`);
});
app.get('/list', (req, res) => {
    res.json(wordList);
});
app.post('/find', (req, res) => {
    try {
        //console.log(req)
        const q = req.body;
        //console.log(q);
        if (q.conditions.filter(e => e.expression === undefined || e.expression === null || e.expression.trim() === ``).length !== 0) {
            res.status(400).send(`Empty or whitespace search phrase in query!`);
            //} else if (q.conditions.filter(e=>e.expression.length>=3).length===0) {
            //	res.status(400).send('At least one phrase must be min. 3 character long (whitespace included)')
        }
        else {
            let searchInTargetLanguage = q.searchInSecondParamLanguage ? true : false;
            let reverseFieldOrder = false;
            const lang1 = `${q.lang1}`;
            const lang2 = `${q.lang2}`;
            const getLevel2Entry = (obj, a, b) => {
                if (typeof obj[a] === `object` && obj[a][b]) {
                    return {
                        exampleSource: obj[a][b],
                        flipLanguageOrderInSearch: false,
                    };
                }
                else if (typeof obj[b] === `object` && obj[b][a]) {
                    return {
                        exampleSource: obj[b][a],
                        flipLanguageOrderInSearch: true,
                    };
                }
                else {
                    throw new Error(`Language pair "${a}"-"${b}" not found.`);
                }
            };
            const { exampleSource, flipLanguageOrderInSearch } = getLevel2Entry(exampleSourceFiles, lang2, lang1);
            if (flipLanguageOrderInSearch) {
                reverseFieldOrder = !reverseFieldOrder;
                searchInTargetLanguage = !searchInTargetLanguage;
            }
            const getResultFromThread = async (workerThread) => {
                return new Promise((resolve, reject) => {
                    try {
                        const requestId = uuid.v4();
                        const requestType = `FIND_ENTRIES`;
                        const threadReqMessage = {
                            requestType: requestType,
                            requestId: requestId,
                            conditions: q.conditions,
                            reverseFieldOrder: reverseFieldOrder,
                            searchInTargetLanguage: searchInTargetLanguage,
                        };
                        workerThread.postMessage(threadReqMessage);
                        const listener = (message) => {
                            if (message.requestType === requestType && message.requestId === requestId) {
                                console.log(`DEBUG: response for message with request type '${message.requestType}' and request id '${message.requestId}' received`);
                                resolvePromiseThenSelfDestruct(message.resultData);
                            }
                        };
                        const resolvePromiseThenSelfDestruct = (threadRes) => {
                            workerThread.removeListener(`message`, listener);
                            resolve(threadRes);
                        };
                        workerThread.on(`message`, listener);
                    }
                    catch (error) {
                        console.error(`Error while getting result from a thread. Details: ${error}`);
                        reject(error);
                    }
                });
            };
            getResultFromThread(exampleSource.workerThread).then((threadRes) => {
                if (q.resultLimit !== undefined && q.resultLimit !== 0) {
                    threadRes.entries = threadRes.entries.slice(0, q.resultLimit);
                }
                //console.log('DEBUG: results sent to client')
                res.json(threadRes);
            });
        }
    }
    catch (error) {
        console.log(error);
        //valamiért TypeScript-ben a catch-ben elfogott paraméternek unknown-nak kell lennie
        if (error instanceof Error) {
            res.status(400).send(error);
        }
        else {
            res.status(400).send(error);
        }
    }
});
/*
export interface Sheet2JSONOpts extends DateNFOption {
    // Output format
    header?: "A"|number|string[];

    //Override worksheet range
    range?: any;

    //Include or omit blank lines in the output
    blankrows?: boolean;

    //Default value for null/undefined values
    defval?: any;

    //if true, return raw data; if false, return formatted text
    raw?: boolean;

    //if true, skip hidden rows and columns
    skipHidden?: boolean;

    //if true, return raw numbers; if false, return formatted numbers
    rawNumbers?: boolean;
}
*/
app.get('/meta', async (req, res) => {
    res.send(Object.keys(dicts).
        map(key => ({
        name: key,
        meta: dicts[key].meta,
    })));
});
app.post('/dict', async (req, res) => {
    try {
        const dictName = (req.body?.name ?? ``).toString();
        if (dictName === `` || dicts[dictName] === undefined) {
            res.status(400).send(`Dictionary "${dictName}" doesn't exist.`);
            return;
        }
        //const code = `/tuh/.test(e.original)`;
        //const code = `e.original.includes('steig')`;
        const searchQuery = req.body?.searchQuery !== `` ? req.body?.searchQuery : undefined ?? `e`;
        const customSortComparison = req.body?.customSortComparison;
        let dict = JSON.parse(JSON.stringify(dicts[dictName].main));
        const codeBox = `dict = dict.filter((e, idx, arr) => ${searchQuery}); ${customSortComparison ? `dict = dict.sort((a,b) => ${customSortComparison})` : ``}`;
        const context = vm.createContext({
            dict,
            RegExp,
        });
        const result = vm.runInContext(codeBox, context);
        res.send(result);
    }
    catch (e) {
        console.log(e);
        res.status(503);
    }
});
