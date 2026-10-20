import { ExampleArrayWithBackendLimit } from "./ExampleArrayWithBackendLimit.js";
export type WorkerResMessage = {
    requestType: string;
    requestId: string;
    resultData: ExampleArrayWithBackendLimit;
};
