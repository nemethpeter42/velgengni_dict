import { SearchCondition } from "./SearchCondition.js";
export type WorkerReqMessage = {
    conditions: SearchCondition[];
    searchInTargetLanguage?: boolean;
    reverseFieldOrder?: boolean;
    requestType: string;
    requestId: string;
};
