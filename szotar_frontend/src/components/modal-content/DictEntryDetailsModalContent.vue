<template>
  <div class="text-sm font-medium text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
    <div>
      <div 
        class="text-gray-800 dark:text-gray-200 font-bold text-lg mb-4 mx-2 min-h-[3.5rem]"
        :class="{
          [`
            bg-orange-200
            dark:bg-orange-900
          `]: store.highlightedIndices.has(store.currentIdx),
          [`
            bg-cyan-200
            dark:bg-cyan-900
          `]: !store.highlightedIndices.has(store.currentIdx) && savedTrExampleStore.examplesOfCurrEntry.length,
        }">
        {{store.entryInTrExampleModalFormat?.join(`; `) ?? ``}}
      </div>
    </div>
            
    <div class="flex flex-wrap items-center">
      <WordListPrevNextButton 
        text="Előző" 
        id="prevWordBtn"
        data-button-for="previous-entry"
        :isDisabled="store.isTheFirstEntryActive" 
        @click=" 
          async () => 
            {
              if(!store.isTheFirstEntryActive){
                store.setCurrentIdx(store.currentIdx-1);
              }
            }"
        />
      <WordListPrevNextButton 
        text="Következő" 
        id="nextWordBtn"
        data-button-for="next-entry"
        :isDisabled="store.isTheLastEntryActive" 
        @click=" 
          async () => 
            {
              if(!store.isTheLastEntryActive){
                store.setCurrentIdx(store.currentIdx+1);
              }
            }"
        />
      <SaveModificationsLargeBtn 
        @click="savedTrExampleStore.saveDb()"
        :isHighlighted="savedTrExampleStore.isDirty"
      />
      <HighlightCurrEntryButton 
        @click="
          store.highlightedIndices.has(store.currentIdx) ? 
            store.highlightedIndices.delete(store.currentIdx) :  
            store.highlightedIndices.add(store.currentIdx)"
        :isHighlighted="store.highlightedIndices.has(store.currentIdx)"
        data-button-for="highligh-current-entry"
      />
      <JumpToEntryButton
        @click="jumpToEntry()"
        data-button-for="jump-to-entry"
      />
    </div>
    <div class="flex flex-wrap -mb-px">   
      <TabOption 
        text="Details" 
        :is-active="store.entryDetailsActiveTab === 1"
        @click="store.setEntryDetailsActiveTab(1)" 
        data-tab-option-for="details"
      />
      <TabOption 
        text="Examples" 
        :is-active="store.entryDetailsActiveTab === 2"
        @click="store.setEntryDetailsActiveTab(2)" 
        data-tab-option-for="examples"
      />
      <TabOption 
        text="Saved examples" 
        :is-active="store.entryDetailsActiveTab === 3"
        :labelText="savedTrExampleStore.examplesOfCurrEntry.length ? savedTrExampleStore.examplesOfCurrEntry.length : undefined"
        @click="store.setEntryDetailsActiveTab(3)" 
        data-tab-option-for="saved-examples"
      />
    </div>
    <div v-if="store.entryDetailsActiveTab === 2">
      <div class="mx-auto">
        <ModalTrExampleFilterPanel storeId="dictModal" />
      </div>
      <div class="max-w-5xl mx-auto pt-2 pb-3">
        <TrExampleDatatable 
        storeId="dictModal" 
        :wordListStoreDisabled="true"
        :addExistingButtonVisible="true"
        @createSavedTrExample="(val: Example) => createSavedTrExample(val)"
        />
      </div>
    </div>
    <div v-if="store.entryDetailsActiveTab === 3">
      <NewSavedExampleEditor />
      <SavedTrExampleDatatable />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDictStore } from '@/stores/dict';
  import TabOption from '../input-fields-and-buttons/TabOption.vue';
  import WordListPrevNextButton from '../input-fields-and-buttons/WordListPrevNextButton.vue';
  import { type TrExampleStoreType } from '@/frontend_models/TrExampleStoreTypes';
  import TrExampleDatatable from '../datatable/TrExampleDatatable.vue';
  import StandaloneTrExampleFilterPanel from '../datatable/filter-panel/StandaloneTrExampleFilterPanel.vue';
  import ModalTrExampleFilterPanel from '../datatable/filter-panel/ModalTrExampleFilterPanel.vue';
  import { type Example } from 'szotar_common/models/Example.js';
  import { useSavedTrExampleStore } from '@/stores/savedTrExample';
  import { useModalStore } from '@/stores/modal';
import SavedTrExampleDatatable from '../datatable/SavedTrExampleDatatable.vue';
import { type SavedTranslationExample } from 'szotar_common/models/SavedTranslationExample.js';
import NewSavedExampleEditor from '../input-fields-and-buttons/NewSavedExampleEditor.vue';
import SaveModificationsLargeBtn from '../input-fields-and-buttons/SaveModificationsLargeBtn.vue';
import JumpToEntryButton from '../input-fields-and-buttons/JumpToEntryButton.vue';
import HighlightCurrEntryButton from '../input-fields-and-buttons/HighlightCurrEntryButton.vue';
  const store = useDictStore(`dictModule`)
  const savedTrExampleStore = useSavedTrExampleStore()
  const modalStore = useModalStore()
  
  const createSavedTrExample = async (example: Example) => {
    const dictName = store.dictNameUsedInLastQuery;
    await savedTrExampleStore.create(
      dictName,
      {
        ...example,
        uuid: ``,
        dictEntryUuid: store.currentUuid,
        isOfLowImportance: false,
        isOfHighImportance: false,
      } as SavedTranslationExample
    );
  }

  const jumpToEntry = async () => {
    const currSortedIdx = store.currentIdx;
    const currEntryIdxBeforeSort = store.currPageOfFilteredEntries[currSortedIdx]?.idx;
    store.quickSearchQueryPhrase = ``;
    modalStore.openModals.delete(`DICT_ENTRY_DETAILS`);
    await new Promise((_) => setTimeout(_, 2500));
    const pageIdx = store.pagesOfFilteredEntries.findIndex(
      page => page.some(e => e.idx === currEntryIdxBeforeSort)
    );
    const entrySubIndex = 
      store.pagesOfFilteredEntries[pageIdx]?.
        findIndex(e => e.idx === currEntryIdxBeforeSort) ?? -1;
    if (pageIdx === -1) {return}
    store.currentPageInputForTwoWayBinding = ''+(pageIdx+1);
    await new Promise((_) => setTimeout(_, 2500));
    document.querySelector(`#datatable-table-top-anchor [data-row-index="${entrySubIndex}"]`)?.scrollIntoView();
  }
</script>