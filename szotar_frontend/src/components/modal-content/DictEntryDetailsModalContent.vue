<template>
  <div class="text-sm font-medium text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
    <div>
      <div class="text-gray-800 dark:text-gray-200 font-bold text-lg mb-4 mx-2">
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
        @click="store.setEntryDetailsActiveTab(3)" 
      />
    </div>
    <div v-if="store.entryDetailsActiveTab === 2">
      <div class="mx-auto">
        <ModalTrExampleFilterPanel :storeId="TrExampleStoreType.DICT_MODAL" />
      </div>
      <div class="max-w-5xl mx-auto pt-2 pb-3">
        <TrExampleDatatable 
          :storeId="TrExampleStoreType.DICT_MODAL" 
          :wordListStoreDisabled="true"
          />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDictStore } from '@/stores/dict';
  import TabOption from '../input-fields-and-buttons/TabOption.vue';
  import WordListPrevNextButton from '../input-fields-and-buttons/WordListPrevNextButton.vue';
  import { TrExampleStoreType } from '@/frontend_models/TrExampleStoreTypes';
  import TrExampleDatatable from '../datatable/TrExampleDatatable.vue';
  import StandaloneTrExampleFilterPanel from '../datatable/filter-panel/StandaloneTrExampleFilterPanel.vue';
  import ModalTrExampleFilterPanel from '../datatable/filter-panel/ModalTrExampleFilterPanel.vue';
  const store = useDictStore()
  
  
</script>