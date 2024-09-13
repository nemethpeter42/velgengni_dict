<template>
  <div class="text-sm font-medium text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
    <div>
      <div 
        class="text-gray-800 dark:text-gray-200 font-bold text-lg mb-4 mx-2 min-h-[3.5rem]"
        :class="{
          [`
            bg-orange-200
            dark:bg-orange-900
          `]: store.selectedIndices.has(store.currentIdx),
          [`
            bg-cyan-200
            dark:bg-cyan-900
          `]: !store.selectedIndices.has(store.currentIdx) && savedTrExampleStore.examplesOfCurrEntry.length,
        }">
        {{store.entryInTrExampleModalFormat?.join(`; `) ?? ``}}
      </div>
    </div>
            
    <div class="flex flex-wrap items-center">
      <WordListPrevNextButton 
        text="Előző" 
        id="prevWordBtn"
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
    </div>
    <div class="flex flex-wrap -mb-px">   
      <TabOption 
        text="Details" 
        :is-active="store.entryDetailsActiveTab === 1"
        @click="store.setEntryDetailsActiveTab(1)" 
      />
      <TabOption 
        text="Examples" 
        :is-active="store.entryDetailsActiveTab === 2"
        @click="store.setEntryDetailsActiveTab(2)" 
      />
      <TabOption 
        text="Saved examples" 
        :is-active="store.entryDetailsActiveTab === 3"
        :labelText="savedTrExampleStore.examplesOfCurrEntry.length ? savedTrExampleStore.examplesOfCurrEntry.length : undefined"
        @click="store.setEntryDetailsActiveTab(3)" 
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
        @createSavedTrExample="val => createSavedTrExample(val)"
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
  import { type Example } from '../../../../libs/szotar_common/src/models/Example';
  import { useSavedTrExampleStore } from '@/stores/savedTrExample';
import SavedTrExampleDatatable from '../datatable/SavedTrExampleDatatable.vue';
import { type SavedTranslationExample } from '../../../../libs/szotar_common/src/models/SavedTranslationExample';
import NewSavedExampleEditor from '../input-fields-and-buttons/NewSavedExampleEditor.vue';
import SaveModificationsLargeBtn from '../input-fields-and-buttons/SaveModificationsLargeBtn.vue';
  const store = useDictStore(`dictModule`)
  const savedTrExampleStore = useSavedTrExampleStore()
  
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
</script>