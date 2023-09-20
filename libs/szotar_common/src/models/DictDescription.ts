
import { ColumnDefinition } from "./ColumnDefinition.js";
export class DictDescription {
    originalCol: string = ``;
    idCol: string = ``;
    sourceLang: string = ``;
    targetLang: string = ``;
    cols: Record<string, ColumnDefinition> = {};
    static fromJson(json: string, translatedColExistsInDict: boolean = false): DictDescription {
        const res = new DictDescription();
        const jsonSourceValues = JSON.parse(json) as DictDescription;
        res.originalCol = jsonSourceValues?.originalCol ?? `original`;
        res.idCol = jsonSourceValues?.idCol ?? `uuid`;
        res.sourceLang = jsonSourceValues?.sourceLang ?? ``;
        res.targetLang = jsonSourceValues?.targetLang ?? ``;
        res.cols = {...jsonSourceValues.cols}
        if (!Object.keys(res.cols).includes(res.originalCol)) {
            res.cols[res.originalCol] = {
                isVisible: true,
                tailwindClasses: `w-80`,
                isUsedInTrExampleSearch: true,
                sequence: -2,
            }
        }
        if (!Object.keys(res.cols).some(key => res.cols[key]?.isMeaningForestCol) && !Object.keys(res.cols).includes(`translated`) && translatedColExistsInDict) {
            res.cols[`translated`] = {
                isVisible: true,
                tailwindClasses: `w-80`,
                isMeaningForestCol: true,
                isUsedInTrExampleSearch: true,
                sequence: -1,
            }
        }
        return res;
    }
}