import { ColumnDefinition } from "./ColumnDefinition.js";
export declare class DictDescription {
    originalCol: string;
    idCol: string;
    sourceLang: string;
    targetLang: string;
    cols: Record<string, ColumnDefinition>;
    static fromJson(json: string, translatedColExistsInDict?: boolean): DictDescription;
}
