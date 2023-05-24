import { DictDescription } from "./DictDescription.js"
import { DictMainTable } from "./DictMainTable.js";

export type Dict = {
    meta: DictDescription;
    main: Array<Record<string, string>>;    
}