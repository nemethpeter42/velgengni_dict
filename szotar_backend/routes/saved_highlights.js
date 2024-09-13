import express from 'express';
import * as fsPromises from 'fs/promises';
const router = express.Router();
const SAVED_HIGHLIGHTS_FOLDER = `./saved_highlights`;
let isInitialized = false;
let savedHighlights = {};
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
        throw new Error(`Error: Saved highlights db didn't initialize after ${limitInMs} ms.`);
    }
};
const fileExists = async (path) => !!(await fsPromises.stat(path).catch(e => false));
const writeExistingDataToFile = async () => {
    try {
        await fsPromises.writeFile(`${SAVED_HIGHLIGHTS_FOLDER}/saved_highlights.json`, JSON.stringify(savedHighlights, null, 2), { encoding: `utf8`, });
    }
    catch (err) {
        console.error(`Error while writing saved highlights file.`);
        throw (err);
    }
};
async function init() {
    try {
        const savedHighlightsFileAlreadyExists = await fileExists(`${SAVED_HIGHLIGHTS_FOLDER}/saved_highlights.json`);
        if (!savedHighlightsFileAlreadyExists) {
            await writeExistingDataToFile();
        }
        const fileTextContent = await fsPromises.readFile(`${SAVED_HIGHLIGHTS_FOLDER}/saved_highlights.json`, { encoding: `utf8`, });
        savedHighlights = JSON.parse(fileTextContent);
    }
    catch (err) {
        console.error(`Error while loading saved highlights file.`);
        throw err;
    }
    console.log(`saved highlights initialization finished`);
    isInitialized = true;
}
;
init();
router.get('/get_all', async (req, res) => {
    await pollInitializationStatus();
    res.json(savedHighlights);
});
router.post('/save_db', async (req, res) => {
    try {
        await pollInitializationStatus();
        const reqBody = req.body;
        if (reqBody && reqBody.db) {
            savedHighlights = reqBody.db;
            await writeExistingDataToFile();
            res.sendStatus(200);
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
export default router;
