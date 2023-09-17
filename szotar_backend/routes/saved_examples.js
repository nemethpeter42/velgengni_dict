import express from 'express';
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
        throw new Error(`Error: Saved translatio example db didn't initialize after ${limitInMs} ms.`);
    }
};
const translationExampleDbs = {};
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
});
router.get('/get_db', async (req, res) => {
    await pollInitializationStatus();
    let result;
    const dictName = req.params?.dictName ?? ``;
    if (dictName.trim() === ``) {
        res.status(400).send(`"dictName" param must not be empty`);
    }
    if (Object.keys(translationExampleDbs).includes(dictName)) {
        result = {
            dbName: dictName,
            examples: translationExampleDbs[dictName],
        };
    }
    else {
        result = {
            dbName: dictName,
            examples: [],
        };
    }
    res.json(result);
});
router.post('/update_db', async (req, res) => {
    await pollInitializationStatus();
    const testPayload = {
        "spanyol_szoszedet": [
            {
                "uuid": "abcdef123456",
                "original": "Hola",
                "translated": "Szia"
            }
        ],
        "nemet_szoszedet": [
            {
                "uuid": "123456abcdef",
                "original": "Auf Wiedersehen!",
                "translated": "Viszontlátásra!"
            }
        ],
    };
    //TODO a megfelelo nyelvnel esetleges felulirassal irunk es utana eltaroljuk az uj allapotot a cache-be is
});
export default router;
