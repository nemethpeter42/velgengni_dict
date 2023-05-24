export class DictDescription {
    originalCol = ``;
    idCol = ``;
    cols = {};
    static fromJson(json) {
        const res = new DictDescription();
        const jsonSourceValues = JSON.parse(json);
        res.originalCol = jsonSourceValues?.originalCol ?? `original`;
        res.idCol = jsonSourceValues?.idCol ?? `uuid`;
        res.cols = { ...jsonSourceValues.cols };
        if (!Object.keys(res.cols).includes(res.originalCol)) {
            res.cols[res.originalCol] = {
                isVisible: true,
                tailwindClasses: `w-80`,
                isUsedInTrExampleSearch: true,
            };
        }
        if (!Object.keys(res.cols).some(key => res.cols[key]?.isMeaningForestCol) && Object.keys(res.cols).includes(`translated`)) {
            res.cols[`translated`] = {
                isVisible: true,
                tailwindClasses: `w-80`,
                isMeaningForestCol: true,
                isUsedInTrExampleSearch: true,
            };
        }
        return res;
    }
}
