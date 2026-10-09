import { Worker } from 'worker_threads';
import * as uuid from "uuid";
import { readOds, sheetToObjects } from './ods_reader.js';
import * as vm from 'node:vm';
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import * as fsPromises from 'fs/promises';
import path from 'path';
import { DictDescription } from 'szotar_common/models/DictDescription.js';
import savedExamplesRouter from './routes/saved_examples.js';
import savedQueriesRouter from './routes/saved_queries.js';
import savedHighlightsRouter from './routes/saved_highlights.js';
import generatedLinksRouter from './routes/generated_links.js';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
const TOTAL_NUMBER_OF_WORKERS = 8;
const __dirname = path.resolve();
const exampleSourceFiles = {
    //target language
    'hu': {
        //source language
        'de': {
            filename: 'example_source_dbs/de-hu.txt',
            workerThreads: [],
        },
        'es': {
            filename: 'example_source_dbs/es-hu.txt',
            workerThreads: [],
        },
        'it': {
            filename: 'example_source_dbs/it-hu.txt',
            workerThreads: [],
        },
        'nl': {
            filename: 'example_source_dbs/nl-hu.txt',
            workerThreads: [],
        },
    },
};
const configFileRawContent = await fsPromises.readFile(`./config.json`, { encoding: `utf8`, });
const config = JSON.parse(configFileRawContent);
const app = express();
app.use(cors());
app.use(express.json());
const portNum = process.env.PORT || 3035;
app.set(`port`, portNum);
app.use(`/saved_examples`, savedExamplesRouter);
app.use(`/saved_queries`, savedQueriesRouter);
app.use(`/saved_highlights`, savedHighlightsRouter);
app.use(`/generated_links`, generatedLinksRouter);
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
const generateChunks = async (filename) => {
    const readLines = (filename) => createInterface({
        input: createReadStream(filename, { encoding: 'utf8' }),
        crlfDelay: Infinity,
    });
    // only non-empty lines are counted, the worker skips empty lines too
    let lineCount = 0;
    for await (const line of readLines(filename)) {
        if (line.trim() !== '') {
            lineCount++;
        }
    }
    const result = [];
    for (let i = 0; i < TOTAL_NUMBER_OF_WORKERS; i++) {
        result.push({
            threadNumber: i + 1,
            firstLineToKeep: Math.floor(i * lineCount / TOTAL_NUMBER_OF_WORKERS),
            lastLineToKeepExclusive: Math.floor((i + 1) * lineCount / TOTAL_NUMBER_OF_WORKERS),
        });
    }
    return result;
};
const startExampleDbThreadsAndReadDicts = () => {
    return [
        //load example-pair db files
        ...Object.keys(exampleSourceFiles).flatMap(targetLang => {
            return Object.keys(exampleSourceFiles[targetLang]).map(async (sourceLang) => {
                const chunks = await generateChunks(exampleSourceFiles[targetLang][sourceLang].filename);
                await Promise.all(chunks.map(chunk => new Promise((resolve, reject) => {
                    try {
                        const worker = new Worker(`./language_level_thread.js`, { workerData: {
                                sourceLang: sourceLang,
                                targetLang: targetLang,
                                filename: exampleSourceFiles[targetLang][sourceLang].filename,
                                threadNumber: chunk.threadNumber,
                                firstLineToKeep: chunk.firstLineToKeep,
                                lastLineToKeepExclusive: chunk.lastLineToKeepExclusive,
                                requestType: `START_WORKER`
                            } });
                        exampleSourceFiles[targetLang][sourceLang].workerThreads.push(worker);
                        worker.once(`message`, (message) => {
                            resolve();
                        });
                    }
                    catch (error) {
                        console.error(`Error while loading thread #${chunk.threadNumber} "${sourceLang}"->"${targetLang}". Details: ${error}`);
                        reject(error);
                    }
                })));
            });
        }),
        ...descFilenames.map(descFilename => {
            const fn = async () => {
                const dictName = descFilename.replaceAll(/\.desc\.json$/gi, ``);
                try {
                    console.log(`reading dictionary: "${dictName}"`);
                    const descFileRawContent = await fsPromises.readFile(`${DICTS_FOLDER}/${descFilename}`, { encoding: `utf8`, });
                    const buffer = await fsPromises.readFile(`${DICTS_FOLDER}/${dictName}.ods`);
                    const [firstSheet] = readOds(buffer);
                    const main = sheetToObjects(firstSheet?.rows ?? []);
                    const colsInDict = Object.keys(main[0] ?? {});
                    const meta = DictDescription.fromJson(descFileRawContent, colsInDict.includes(`translated`)); // JSON.parse(descFileRawContent) as DictDescription
                    for (const col of colsInDict) {
                        if (!Object.keys(meta.cols).includes(col)) {
                            meta.cols[col] = {
                                tailwindClasses: ``,
                            };
                        }
                    }
                    dicts[dictName] = { main, meta, };
                    console.log(`reading dictionary "${dictName}" finished`);
                }
                catch (error) {
                    console.error(`Error while reading dictionary "${dictName}"`);
                    throw (error);
                }
            };
            return fn();
        }),
    ];
};
Promise.all(startExampleDbThreadsAndReadDicts()).then(() => {
    console.log(`all threads ready`);
    console.log(`listening on port: ${portNum}`);
    app.listen(app.get(`port`));
});
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/opensubtitles_db_szokereso_regi_frontend.html`);
});
app.get('/list', (req, res) => {
    res.json(wordList);
});
app.get('/tr_example_languages', (req, res) => {
    let result = [];
    for (const l1 of Object.keys(exampleSourceFiles)) {
        for (const l2 of Object.keys(exampleSourceFiles[l1])) {
            result.push({ lang1: l2, lang2: l1, });
            result.push({ lang1: l1, lang2: l2, });
        }
    }
    const defaultLangPairExists = result.filter(e => e.lang1 !== `` &&
        e.lang1 === config.defaultTrExampleLang1 &&
        e.lang2 !== `` &&
        e.lang2 === config.defaultTrExampleLang2).length > 0;
    if (defaultLangPairExists) {
        result = [
            { lang1: config.defaultTrExampleLang1, lang2: config.defaultTrExampleLang2, },
            ...result.filter(e => !(e.lang1 === config.defaultTrExampleLang1 && e.lang2 === config.defaultTrExampleLang2)),
        ];
    }
    res.json(result);
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
            const getResultFromThreads = async (workerThreads) => {
                const result = await Promise.all(workerThreads.map(workerThread => new Promise((resolve, reject) => {
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
                                //console.log(`DEBUG: response for message with request type '${message.requestType}' and request id '${message.requestId}' received`);
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
                })));
                return {
                    entries: result.flatMap(e => e.entries),
                    backendResultLimit: result?.at(0)?.backendResultLimit ?? -1,
                };
            };
            getResultFromThreads(exampleSource.workerThreads).then((threadRes) => {
                if (q.resultLimit !== undefined && q.resultLimit !== 0) {
                    threadRes.entries = threadRes.entries.slice(0, q.resultLimit);
                }
                //console.log('DEBUG: results sent to client')
                res.setHeader('Content-Type', 'application/json').status(200).send(JSON.stringify(threadRes, null, 2));
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
    let result = Object.keys(dicts).
        map(key => ({
        name: key,
        meta: dicts[key].meta,
    }));
    if ((config.defaultDictionary ?? ``) !== ``) {
        result = [
            ...result.filter(e => e.name === config.defaultDictionary),
            ...result.filter(e => e.name !== config.defaultDictionary),
        ];
    }
    res.send(result);
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
        const searchQuery = (req.body?.searchQuery !== `` ? req.body?.searchQuery : undefined) ?? `e`;
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
