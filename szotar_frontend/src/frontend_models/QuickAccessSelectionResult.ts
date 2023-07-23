export type QuickAccessSelectionResult = {
  words: string[],
  isInverseSearch: boolean,
  onlyWithSpacePrefix?: boolean,
  onlyWithSpaceDotOrCommaSuffix?: boolean,
}