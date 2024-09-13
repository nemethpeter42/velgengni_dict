import { Example } from "./Example.js";
export type SavedTranslationExample = Example & {
    dictEntryUuid: string;
    uuid: string;
    isOfHighImportance?: boolean;
    isOfLowImportance?: boolean;
};
