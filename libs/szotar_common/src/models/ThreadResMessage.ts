import { ExampleArrayWithBackendLimit } from "./ExampleArrayWithBackendLimit.js";

export type ThreadResMessage = {
    requestType: string,
    requestId: string,
    resultData: ExampleArrayWithBackendLimit,
}