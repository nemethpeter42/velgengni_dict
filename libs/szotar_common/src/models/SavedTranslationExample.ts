import { Example } from "./Example.js";

export type SavedTranslationExample = Example & {
	dictEntryUuid: string;
	uuid: string;
	isGrammaticalExample?: boolean;
	isLowPriority?: boolean;
}