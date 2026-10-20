import { useDictStore } from '@/stores/dict';
import { useModalStore } from '@/stores/modal';
import type { DictStoreType } from '@/frontend_models/DictStoreType.js';

// closes the entry details modal, then pages & scrolls the datatable to the current entry
// for now it works with hardcoded delays. 
// TODO later on i will synchronize it to the appearance of certain DOM elements
export const jumpToEntry = async (dictStoreType: DictStoreType) => {
  const store = useDictStore(dictStoreType);
  const modalStore = useModalStore();
  const currSortedIdx = store.currentIdx;
  const currEntryIdxBeforeSort = store.currPageOfFilteredEntries[currSortedIdx]?.idx;
  store.quickSearchQueryPhrase = ``;
  modalStore.openModals.delete(`DICT_ENTRY_DETAILS-${dictStoreType}`);
  await new Promise((_) => setTimeout(_, 2000));
  const pageIdx = store.pagesOfFilteredEntries.findIndex(
    page => page.some(e => e.idx === currEntryIdxBeforeSort)
  );
  const entrySubIndex =
    store.pagesOfFilteredEntries[pageIdx]?.
      findIndex(e => e.idx === currEntryIdxBeforeSort) ?? -1;
  if (pageIdx === -1) {return}
  store.currentPageInputForTwoWayBinding = ''+(pageIdx+1);
  await new Promise((_) => setTimeout(_, 2000));
  document.querySelector(`#datatable-table-top-anchor [data-row-index="${entrySubIndex}"]`)?.scrollIntoView();
}
