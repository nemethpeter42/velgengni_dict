import * as fsPromises from 'fs/promises'
import { BackendConfig } from 'szotar_common/models/BackendConfig.js';
import { MongoClient } from 'mongodb';
import fs from 'fs'
import readline from 'readline'

type LanguageCodePair = {
	lang1Code: string,
	lang2Code: string,
}

type TranslationPairFile = LanguageCodePair & {
	filename: string,
}

type TranslationPair = LanguageCodePair & {
	lang1Content: string,
	lang2Content: string,
}

const insertBatchSize = 10000
const queryResultLimit = 100
const searchTerm = `marha`

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)
}

const configFileRawContent = await fsPromises.readFile(`./config.json`, {encoding: `utf8`,})
const config = JSON.parse(configFileRawContent) as BackendConfig

if (!Array.isArray(config.translationPairFilesUsed)) {
	console.error(`config.json has no "translationPairFilesUsed" array`)
	process.exit(1)
}
/*
const translationPairFiles: TranslationPairFile[] = []
for (const entry of config.translationPairFilesUsed) {
	const dashIndex = entry.indexOf(`-`)
	if (dashIndex === -1) {
		console.error(`Skipping "${entry}": no dash found`)
		continue
	}
	translationPairFiles.push({
		filename: `${entry}.txt`,
		lang1Code: entry.slice(0, dashIndex),
		lang2Code: entry.slice(dashIndex + 1),
	})
}

console.log(translationPairFiles)

if (!config.mongoCredentials) {
	console.error(`config.json has no "mongoCredentials" object`)
	process.exit(1)
}

*/
const { host, port, username, password, database, authSource } = config.mongoCredentials
const mongoClient = new MongoClient(`mongodb://${host}:${port}`, {
	auth: { username, password },
	authSource,
})
try {
	await mongoClient.connect()
	const db = mongoClient.db(database)
	await db.command({ ping: 1 })
	console.log(`Logged in to MongoDB database "${database}" at ${host}:${port}`)

	const tpCollectionExists = (await db.listCollections({ name: `translation_pairs` }).toArray()).length > 0

	const lcpCollectionExists = (await db.listCollections({ name: `languages` }).toArray()).length > 0

	const tpCollection = db.collection<TranslationPair>(`translation_pairs`)
/*
	const lcpCollection = db.collection<LanguageCodePair>(`language_code_pairs`)
	
	if (tpCollectionExists) {
		await tpCollection.drop({})
		console.log(`Dropped collection "translation_pairs"`)
	}

	if (lcpCollectionExists) {
		await lcpCollection.drop({})
		console.log(`Dropped collection "language_code_pairs"`)
	}

	await db.createCollection(`translation_pairs`)
	console.log(`Created collection "translation_pairs"`)

	await db.createCollection(`language_code_pairs`)
	console.log(`Created collection "language_code_pairs"`)


	for (const { filename, lang1Code, lang2Code } of translationPairFiles) {
		await lcpCollection.insertOne({lang1Code, lang2Code});
		
		const lineReader = readline.createInterface({
			input: fs.createReadStream(`./example_source_dbs/${filename}`, { encoding: `utf8` }),
			crlfDelay: Infinity,
		})

		let batch: TranslationPair[] = []
		let insertedCount = 0
		for await (const line of lineReader) {
			const parts = line.split(`\t`)
			if (parts.length !== 2) {
				continue
			}
			batch.push({ lang1Code, lang2Code, lang1Content: parts[0], lang2Content: parts[1] })
			if (batch.length >= insertBatchSize) {
				await tpCollection.insertMany(batch, { ordered: false })
				insertedCount += batch.length
				batch = []
			}
		}
		if (batch.length > 0) {
			await tpCollection.insertMany(batch, { ordered: false })
			insertedCount += batch.length
		}
		console.log(`Inserted ${insertedCount} translation pairs from ${filename}`)
	}
*/
	const searchRegex = new RegExp(`(^|[ ])${escapeRegex(searchTerm)}($|[ \\.,;\?!])`)
	
	const queryResult = await tpCollection
		.find({ lang2Content: {$regex: searchRegex}, lang1Code:'it', lang2Code: 'hu' })
		.limit(queryResultLimit)
		.toArray()
	console.log(queryResult)
} catch (err) {
	console.error(`Failed to load translation pairs into MongoDB:`, err)
	process.exitCode = 1
} finally {
	await mongoClient.close()
}
