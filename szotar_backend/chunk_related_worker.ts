import { Worker, isMainThread, parentPort as parentPortUnchecked, workerData, MessagePort } from 'worker_threads';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import {Example} from 'szotar_common/models/Example.js'
import {WorkerReqMessage} from 'szotar_common/models/WorkerReqMessage.js'
import {WorkerResMessage} from 'szotar_common/models/WorkerResMessage.js'
import { getPatternForSearchCondition } from 'szotar_common/helpers/getPatternForSearchCondition.js';
import { swapFirstCharCase } from 'szotar_common/helpers/swapFirstCharCase.js';


const BACKEND_RESULT_LIMIT: number = 20000;//10000;
const readLines = (filename: string) => createInterface({
	input: createReadStream(filename, {encoding: 'utf8'}),
	crlfDelay: Infinity,
})


const db: Example[] = []
let lineIdx = 0
for await (const line of readLines(workerData.filename)) {
	if (line.trim()==='') {
		continue
	}
	if (lineIdx >= workerData.lastLineToKeepExclusive) {
		break
	}
	if (lineIdx >= workerData.firstLineToKeep) {
		db.push({original:line.split('\t')[0].trim(), translated:line.split('\t')[1].trim()})
	}
	lineIdx++
}

console.log('worker #'+workerData.threadNumber+' for '+workerData.sourceLang+' <-> '+workerData.targetLang+' ready')

//null-check
if (parentPortUnchecked === null){
	throw new Error(`parentPort is null`)
}
const parentPort = parentPortUnchecked as MessagePort

parentPort.postMessage({threadStartStatus:'ready'})

parentPort.on('message', (q: WorkerReqMessage) => {
	let filteredEntries = db
	// hossz szerint csokkeno sorrendben rendezes
	//(ES logikat feltetelez ha regex-et csinalnal, feltetlenul vedd ki) 
	// => ez valoszinuleg soha nem fog megtortenni 
	q.conditions = q.conditions.sort((a,b)=>b.expression.length-a.expression.length)
	for (const searchCondition of q.conditions) {
		searchCondition.expression = searchCondition.expression.trim()

		const searchRegex = new RegExp(getPatternForSearchCondition(searchCondition),'i')
		
		filteredEntries = filteredEntries.filter(e=>{
			let subtitleStr = q.searchInTargetLanguage===true ? e.translated : e.original;
			return searchRegex.test(subtitleStr)
			
		})
	}

	filteredEntries = filteredEntries.slice(0,BACKEND_RESULT_LIMIT)
	const workerResMessage: WorkerResMessage = {
		requestType:q.requestType,
		requestId:q.requestId,
		resultData:{
			entries: (
				q.reverseFieldOrder ? 
				filteredEntries.map(e=>({original:e.translated,translated:e.original})): 
				filteredEntries
			),
			backendResultLimit: BACKEND_RESULT_LIMIT,
		}
	}
	parentPort.postMessage(workerResMessage);
});