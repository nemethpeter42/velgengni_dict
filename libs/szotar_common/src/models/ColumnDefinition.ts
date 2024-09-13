export class ColumnDefinition {
    isVisible?: boolean;
    tailwindClasses?: string = ``;
    isMeaningForestCol?: boolean;
    isDefaultMeaningForestCol?: boolean;
    isUsedInTrExampleSearch?: boolean;
    isTrExamplePairCol?: boolean;
    sequence?: number;
}