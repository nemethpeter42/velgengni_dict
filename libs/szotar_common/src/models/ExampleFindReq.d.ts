import { SearchCondition } from "./SearchCondition.js";
export type ExampleFindReq = {
    conditions: SearchCondition[];
    searchInSecondParamLanguage?: boolean;
    lang1: string;
    lang2: string;
    resultLimit?: number;
};
