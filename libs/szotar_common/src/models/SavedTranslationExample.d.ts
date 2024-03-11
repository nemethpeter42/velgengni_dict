import { Example } from "./Example.js";
export type SavedTranslationExample = Example & {
    dictEntryUuid: string;
    uuid: string;
    isLowPriority?: boolean;
};
