import { ColumnDefinition } from "./ColumnDefinition.js";
export declare class DictDescription {
    originalCol: string;
    idCol: string;
    cols: Record<string, ColumnDefinition>;
    static fromJson(json: string): DictDescription;
}
