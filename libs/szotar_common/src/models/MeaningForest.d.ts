import { MeaningBranch } from "./MeaningBranch.js";
import { MeaningLeaf } from "./MeaningLeaf.js";
export declare class MeaningForest {
    val: MeaningBranch<MeaningBranch<MeaningLeaf>>[];
    toString(): string;
    includes(searchPhrase: string, wholeWordMatch?: boolean): boolean;
    includesRegex(regexRaw: string, wholeWordMatch?: boolean): boolean;
    constructor(val?: MeaningBranch<MeaningBranch<MeaningLeaf>>[]);
    static fromString: (meaningsColumnEntryInCsv: string) => MeaningForest;
}
