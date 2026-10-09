import { MongoCredentials } from './MongoCredentials.js';
export type BackendConfig = {
    defaultTrExampleLang1?: string;
    defaultTrExampleLang2?: string;
    defaultDictionary?: string;
    translationPairFilesUsed: string[];
    mongoCredentials: MongoCredentials;
};
