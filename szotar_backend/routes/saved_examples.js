import express from 'express';
import { move } from '../../libs/szotar_common/src/helpers/move.js';
import * as uuidGenerator from "uuid";
import * as fsPromises from 'fs/promises';
let isInitialized = false;
const pollInitializationStatus = async (limitInMs = 30000) => {
    let timeLeftInMs = limitInMs;
    const pollInterval = 100;
    while (timeLeftInMs > 0) {
        if (isInitialized === true) {
            break;
        }
        await new Promise(r => setTimeout(r, pollInterval));
        timeLeftInMs -= pollInterval;
    }
    if (isInitialized === false) {
        throw new Error(`Error: Saved translation example db didn't initialize after ${limitInMs} ms.`);
    }
};
let translationExampleDbs = {};
const router = express.Router();
const DICTS_FOLDER = `./dicts`;
const fileExists = async (path) => !!(await fsPromises.stat(path).catch(e => false));
const savedExampleFilenames = (await fsPromises.readdir(DICTS_FOLDER, { withFileTypes: true }))
    .filter(item => !item.isDirectory() && item.name.endsWith(`.trexample.json`))
    .map(item => item.name);
const promises = [
    savedExampleFilenames.map(savedExampleFilename => {
        const fn = async () => {
            const dictName = savedExampleFilename.replaceAll(/\.trexample\.json$/gi, ``);
            try {
                console.log(`reading saved translation example file: "${dictName}"`);
                const savedExampleFileRawContent = await fsPromises.readFile(`${DICTS_FOLDER}/${savedExampleFilename}`, { encoding: `utf8`, });
                translationExampleDbs[dictName] = JSON.parse(savedExampleFileRawContent);
                console.log(`reading saved translation example "${dictName}" finished`);
            }
            catch (error) {
                console.log(`Error while reading saved translation example for "${dictName}"`);
                throw (error);
            }
        };
        return fn();
    }),
];
Promise.all(promises).then(() => {
    isInitialized = true;
}).catch(err => {
    console.error(err);
    throw (new Error(`Error while loading translation example files`));
});
router.get('/get_db', async (req, res) => {
    await pollInitializationStatus();
    res.json(translationExampleDbs);
});
router.post('/create', async (req, res) => {
    try {
        await pollInitializationStatus();
        const reqBody = req.body;
        if (reqBody && reqBody.dictName && reqBody.entry) {
            reqBody.entry.uuid = uuidGenerator.v4();
            if (!translationExampleDbs[reqBody.dictName]) {
                translationExampleDbs[reqBody.dictName] = [];
            }
            translationExampleDbs[reqBody.dictName].push(reqBody.entry);
            res.json({ uuid: reqBody.entry.uuid, });
        }
        else {
            throw Error(`Request body is in incorrect format.`);
        }
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            res.status(400).send(error);
        }
        else {
            res.status(400).send(error);
        }
    }
});
router.post('/move', async (req, res) => {
    try {
        await pollInitializationStatus();
        const reqBody = req.body;
        if (reqBody && reqBody.dictName && [`UP`, `DOWN`].includes(reqBody.direction ?? ``)) {
            if (!translationExampleDbs[reqBody.dictName]) {
                throw Error(`Saved translation example db for "${reqBody.dictName}" doesn't exist`);
            }
            if (reqBody?.uuid) {
                translationExampleDbs[reqBody.dictName] = move(translationExampleDbs[reqBody.dictName], reqBody.direction, reqBody?.uuid);
                res.send(200);
                return;
            }
            else {
                throw Error(`Saved translation example not found.`);
            }
        }
        else {
            throw Error(`Request body is in incorrect format.`);
        }
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            res.status(400).send(error);
        }
        else {
            res.status(400).send(error);
        }
    }
});
router.put('/update', async (req, res) => {
    try {
        await pollInitializationStatus();
        const reqBody = req.body;
        if (reqBody && reqBody.dictName && reqBody.entry) {
            if (!translationExampleDbs[reqBody.dictName]) {
                throw Error(`Saved translation example db for "${reqBody.dictName}" doesn't exist`);
            }
            const idx = translationExampleDbs[reqBody.dictName].findIndex(e => e.uuid === reqBody.entry?.uuid);
            if (idx !== -1) {
                translationExampleDbs[reqBody.dictName][idx] = reqBody.entry;
                res.send(200);
                return;
            }
            else {
                throw Error(`Saved translation example not found.`);
            }
        }
        else {
            throw Error(`Request body is in incorrect format.`);
        }
        //TODO modositani a req.body alapjan majd kuldeni egy 200-at ha minden jo
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            res.status(400).send(error);
        }
        else {
            res.status(400).send(error);
        }
    }
});
router.delete('/delete', async (req, res) => {
    try {
        await pollInitializationStatus();
        const reqBody = req.body;
        const uuid = reqBody?.uuid ?? ``;
        const dictName = reqBody?.dictName ?? ``;
        if (translationExampleDbs[dictName]) {
            translationExampleDbs[dictName] = translationExampleDbs[dictName].filter(e => e.uuid !== uuid);
        }
        else {
            res.status(400).send(`Saved translation example db for "${dictName}" doesn't exist`);
        }
        res.sendStatus(200);
        return;
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            res.status(400).send(error);
        }
        else {
            res.status(400).send(error);
        }
    }
});
router.post('/save_db', async (req, res) => {
    try {
        await pollInitializationStatus();
        //const payload:Record<string,SavedTranslationExample[]> = req.body;
        const promises = [
            Object.keys(translationExampleDbs).map(dictName => {
                const fn = async () => {
                    try {
                        console.log(`writing saved translation example file: "${dictName}"`);
                        await fsPromises.writeFile(`${DICTS_FOLDER}/${dictName}.trexample.json`, JSON.stringify(translationExampleDbs[dictName]), { encoding: `utf8`, });
                    }
                    catch (error) {
                        console.log(`Error while writing saved translation example for "${dictName}"`);
                        throw (error);
                    }
                };
                return fn();
            }),
        ];
        Promise.all(promises).then(() => {
            //translationExampleDbs = {...translationExampleDbs, ...payload};
            res.sendStatus(200);
            return;
        }).catch((err) => { throw err; });
    }
    catch (error) {
        console.error(error);
        //valamiért TypeScript-ben a catch-ben elfogott paraméternek unknown-nak kell lennie
        if (error instanceof Error) {
            res.status(400).send(error);
        }
        else {
            res.status(400).send(error);
        }
    }
});
export default router;
