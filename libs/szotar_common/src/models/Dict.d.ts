import { DictDescription } from "./DictDescription.js";
export type Dict = {
    meta: DictDescription;
    main: Array<Record<string, string>>;
};
