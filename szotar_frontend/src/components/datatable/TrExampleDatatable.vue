<template>
  <div class="relative">
    <DtSpinner
      v-if="trExampleStore.isLoading" 
      test-id="tr-example-datatable"
    />
    <div 
      v-if="!props.wordListStoreDisabled && wordListStore.currentIdx !== -1" 
      class="text-gray-800 dark:text-gray-200 font-bold text-lg mb-4 mx-2"
      >
      {{ wordListStore.wordList[wordListStore.currentIdx]?.join(`; `) }}
    </div>
    <div 
      v-if="wordListStore.currentIdx !== -1" 
      class="m-1"
    >
      <TrExampleStats :storeId="props.storeId" />
    </div>
    <div class="shadow-md sm:rounded-lg" id="tr-example-table-top-anchor">
      <div class="flex flex-wrap items-center justify-between border-t-2 border-x-2 border-cyan-200 dark:border-indigo-900 sm:rounded-t-lg">
        <div class="my-1.5">
          
          <DictBulkActions />
          
        </div>
        <div class="flex my-1.5">
          <QuickSearch 
            :modelValue="trExampleStore.quickSearchQueryPhrase"
            @update:modelValue="val => trExampleStore.setQuickSearchQueryPhrase(val)"
            @input="trExampleStore.jumpToPage(`FIRST`);"
          />
        </div>
      </div>
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        
        <HeaderOfColumns 
          :columnDefinitions="[{colName:`example`, colDef:{isVisible: true,isTrExamplePairCol:true,}}]"
          :isAllSelected="trExampleStore.isAllSelected"
          :sortCol="trExampleStore.sortCol"
          :sortAscending="trExampleStore.sortAscending"
          @toggleSort="(colName: string) => trExampleStore.toggleSort(colName)"
          @toggleAllSelection="trExampleStore.toggleAllSelection()"
        />
        
        <DatatableBody
          :onePageOfEntries="trExampleStore.onePageOfFilteredEntries"
          :columnDefinitions="[{colName:`example`, colDef:{isVisible: true,isTrExamplePairCol:true,}}]"
          :displayColsAsRawString="false"
          :selectedIndices="trExampleStore.selectedIndices"
          :highlightedTexts="trExampleStore.phrasesUsedInHighlight"
          @toggleRowSelection="(idx: number,$event: Event) => toggleRowSelection(idx,$event)"
        >
          <template #rowLevelButtons="{idx,}">
            <span 
              class="ml-3 w-10"
              >
              #{{ idx + 1 }}
            </span>
          </template>
        </DatatableBody>
      </table>
      <nav class="
          py-3 px-2
          flex items-center justify-between 
          border-b-2 border-x-2 
          border-cyan-200 
          dark:border-indigo-900
          sm:rounded-b-lg
        " 
        aria-label="Table navigation"
        >
        <PageSizeInput 
          :options="trExampleStore.resultsPerPageOptions" 
          :currently-selected="trExampleStore.resultsPerPage"
          @input="(val: number) => {trExampleStore.setResultsPerPage(val);trExampleStore.jumpToPage(`FIRST`);scrollToTableTop();}"
          />
        <DtPagination 
          @jumpToPage="(pageJumpType: PageJumpType) => {trExampleStore.jumpToPage(pageJumpType); scrollToTableTop();}" 
          :isFirstPage="trExampleStore.isFirstPage"
          :isLastPage="trExampleStore.isLastPage" 
          v-model="trExampleStore.currentPageInputForTwoWayBinding"
          :isGivenInputAValidPage="trExampleStore.currentPageInputField.valid"  
          >
        </DtPagination>
      </nav>
    </div>
  </div>
</template>
<script lang="ts" setup>
import DtPagination from '@/components/datatable/DtPagination.vue'
import { onMounted } from 'vue';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PageJumpType } from '@/frontend_models/PageJumpType';
import DictBulkActions from '@/components/datatable/DictBulkActions.vue';
import QuickSearch from '@/components/datatable/QuickSearch.vue';
import PageSizeInput from './PageSizeInput.vue';
import HeaderOfColumns from './HeaderOfColumns.vue';
import DatatableBody from './DatatableBody.vue';
import { useTranslationExampleStore } from '@/stores/translationExample';
import { useWordListStore } from '@/stores/wordList';
import TrExampleStats from './TrExampleStats.vue';
import { TrExampleStoreType } from '@/frontend_models/TrExampleStoreTypes';
import DtSpinner from './DtSpinner.vue';

const props = defineProps({  
    storeId: {type: String, required: true,},
    wordListStoreDisabled: {type: Boolean, required: false,},
})

const trExampleStore = useTranslationExampleStore(props.storeId)
const wordListStore = useWordListStore()



const scrollToTableTop = (): void => {
    document.getElementById('tr-example-table-top-anchor')?.scrollIntoView();
};

//debug celokra (pl. event) ideiglenesen behuzhato
//const log = (param: any) => console.log(param)

const toggleRowSelection = (index: number, $event: Event) => {
  ($event?.target as HTMLInputElement)?.checked ? trExampleStore.selectedIndices.add(index): trExampleStore.selectedIndices.delete(index)
} 

// initialize components based on data attribute selectors
onMounted(async () => {
  `TODO kell?`
})


</script>