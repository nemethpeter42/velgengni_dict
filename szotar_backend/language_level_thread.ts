import { Worker, isMainThread, parentPort as parentPortUnchecked, workerData, MessagePort } from 'worker_threads';
import { readFileSync } from 'fs';
import {SearchCondition} from '../libs/szotar_common/src/models/SearchCondition.js'
import {Example} from '../libs/szotar_common/src/models/Example.js'
import {ThreadReqMessage} from '../libs/szotar_common/src/models/ThreadReqMessage.js'
import {ThreadResMessage} from '../libs/szotar_common/src/models/ThreadResMessage.js'


const BACKEND_RESULT_LIMIT: number = 20000;//10000;
const db: Example[] = readFileSync(workerData.filename).
	toString().
	split("\n").
	filter(e=>e.trim()!=='').
	map(e=>({original:e.split('\t')[0].trim(), translated:e.split('\t')[1].trim()}))
console.log('thread for '+workerData.sourceLang+' <-> '+workerData.targetLang+' ready')

//null-check
if (parentPortUnchecked === null){
	throw new Error(`parentPort is null`)
}
const parentPort = parentPortUnchecked as MessagePort

parentPort.postMessage({threadStartStatus:'ready'})

//TODO egyelore csak bohockodik
parentPort.on('message', (q: ThreadReqMessage) => {
	let filteredEntries = db
	//console.log(q)
	// hossz szerint csokkeno sorrendben rendezes
	//(ES logikat feltetelez ha regex-et csinalnal, feltetlenul vedd ki) 
	// => ez valoszinuleg soha nem fog megtortenni 
	q.conditions = q.conditions.sort((a,b)=>b.expression.length-a.expression.length)
	for (const searchCondition of q.conditions) {
		searchCondition.expression = searchCondition.expression.trim()
		let genExpression: string[]
		if (searchCondition.onlyWithSpaceDotOrCommaSuffix){
			genExpression = [`${searchCondition.expression} `,`${searchCondition.expression}.`,`${searchCondition.expression},`]
		} else {
			genExpression = [searchCondition.expression]
		}
		let swapFirstCharCase =
			(e: string)=> (
				e.charAt(0).toLowerCase()===e.charAt(0)?
				e.charAt(0).toUpperCase():
				e.charAt(0).toLowerCase()
			) + e.substring(1)
		genExpression = genExpression.concat(genExpression.map((e: string) => swapFirstCharCase(e)))
		if (searchCondition.onlyWithSpacePrefix){
			genExpression = genExpression.map(e=>' '+e)
		}
		console.log(genExpression)
		console.log(filteredEntries[0])
		filteredEntries = filteredEntries.filter(e=>{
			return genExpression.some( ph => {
				let subtitleStr = q.searchInTargetLanguage===true ? e.translated : e.original
				//console.log(e)
				//console.log(typeof q.searchInTargetLanguage)
				//console.log(subtitleStr)
				if (subtitleStr.includes(ph)){
					//console.log('bingó')
					return true
				}
			})
		})
		console.log(filteredEntries.length)
	}

	filteredEntries = filteredEntries.slice(0,BACKEND_RESULT_LIMIT)
	console.log(JSON.stringify(q))
	const threadResMessage: ThreadResMessage = {
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
	parentPort.postMessage(threadResMessage);
});