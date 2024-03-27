import { SavedTranslationExample } from "../models/SavedTranslationExample.js";

export const move = (arr: SavedTranslationExample[], direction: `UP` | `DOWN`, uuid?: string): SavedTranslationExample[] => {
  const res = [...arr];
  if (uuid){
    const idx = arr.findIndex(e=>e.uuid === uuid); 
    const dictEntryUuid = arr[idx].dictEntryUuid
    if (idx!==-1 && dictEntryUuid) {
      let neighborIdx
      //alternative solution, as i couldn't manage to enable findLastIndex in the node config
      if (direction===`UP`) {
        neighborIdx = arr.map((e,i)=>({e,i,})).filter(box=> box.i<idx && box.e.dictEntryUuid===dictEntryUuid).reverse().at(0)?.i ?? -1;
      } else {
        neighborIdx = arr.map((e,i)=>({e,i,})).filter(box=> box.i>idx && box.e.dictEntryUuid===dictEntryUuid).at(0)?.i ?? -1;
      }
      if (neighborIdx !== -1) {
        [res[idx], res[neighborIdx]] = [res[neighborIdx], res[idx]];
      }
    }
  }
  return res;
}
