import { DictDescription } from "./DictDescription.js"
import type { DictMainTable } from "./DictMainTable.js";

export type Dict = {
    meta: DictDescription;
    main: Array<Record<string, string>>;    
}