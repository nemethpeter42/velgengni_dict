import { SearchCondition } from "./SearchCondition.js";

export type ThreadReqMessage = {
	conditions: SearchCondition[],
	searchInTargetLanguage?: boolean,
	reverseFieldOrder?: boolean,
	requestType: string,
	requestId: string,
}
