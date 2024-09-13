import express, { json } from 'express';
import * as fsPromises from 'fs/promises'
import * as uuidGenerator from "uuid";

import { SavedDictQuery } from '../../libs/szotar_common/src/models/SavedDictQuery.js';

const router = express.Router()

const SAVED_QUERIES_FOLDER = `./saved_queries`

let isInitialized: boolean = false

let savedDictQueries: Record<string,SavedDictQuery[]> = {}

const pollInitializationStatus = async (limitInMs: number = 30000) => {
  let timeLeftInMs = limitInMs
  const pollInterval: number = 100;
  while (timeLeftInMs > 0) {
    if (isInitialized===true) {break}
    await new Promise(r => setTimeout(r, pollInterval)); 
    timeLeftInMs -= pollInterval
  }
  if (isInitialized === false) {
    throw new Error (`Error: Saved dictionary query db didn't initialize after ${limitInMs} ms.`)
  }
}
const fileExists = async (path: string) => !!(await fsPromises.stat(path).catch(e => false));

const writeExistingDataToFile = async() => {
  try {
    await fsPromises.writeFile(`${SAVED_QUERIES_FOLDER}/saved_queries.json`,JSON.stringify(savedDictQueries, null, 2) ,{encoding: `utf8`,});
  } catch (err){
    console.error(`Error while writing saved dictionary query file.`)
    throw (err)
  }
}

async function init() {
  try {
    const savedQueryFileAlreadyExists = await fileExists(`${SAVED_QUERIES_FOLDER}/saved_queries.json`);
    if (!savedQueryFileAlreadyExists) {
      await writeExistingDataToFile()
    }
    const fileTextContent = await fsPromises.readFile(`${SAVED_QUERIES_FOLDER}/saved_queries.json`, {encoding: `utf8`,}) 
    savedDictQueries = JSON.parse(fileTextContent) as Record<string,SavedDictQuery[]>
  } catch (err) {
    console.error(`Error while loading saved dictionary query file.`)
    throw err;
  }
  console.log(`saved dictionary queries initialization finished`)
  isInitialized = true;
};
init()


router.get('/get_all', async (req, res) => {
  await pollInitializationStatus()
  res.json(savedDictQueries);
})


router.post('/create', async (req,res) => {
  try{
    await pollInitializationStatus();
    const reqBody = req.body as {entry?: SavedDictQuery, group?: string};
    if (reqBody && reqBody.entry && reqBody.group) {
      reqBody.entry.uuid = uuidGenerator.v4();
      if (!savedDictQueries[reqBody.group]){
        savedDictQueries[reqBody.group] = []
      }
      savedDictQueries[reqBody.group].push(reqBody.entry)
      await writeExistingDataToFile();
      res.json({uuid: reqBody.entry.uuid,})
    } else {
      throw Error(`Request body is in incorrect format.`)
    }    
  } catch (error: unknown) {
    console.error(error)
    if (error instanceof Error) {
      res.status(400).send(error)
    } else {
      res.status(400).send(error)
    }
  }
})

export default router;