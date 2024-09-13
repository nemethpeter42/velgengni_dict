export type ExportedEntry = {
  originalCol: string,
  translatedCol: string,
}
type FolderNameAsString = string; 

export type ExportModuleRequest = {
  data: Record<FolderNameAsString, ExportedEntry[]>,
  pageSize: number,
  percentageWhenOriginalIsAsked: number,
}

