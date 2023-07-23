<template>
  <div class="shadow-md sm:rounded-lg" id="datatable-table-top-anchor">
    <div class="flex flex-wrap items-center justify-between border-t-2 border-x-2 border-cyan-200 dark:border-indigo-900 sm:rounded-t-lg">
      <div class="my-1.5">
        
        <DictBulkActions />
        
      </div>
      <div class="flex my-1.5">
        <QuickSearch 
          v-model="store.quickSearchQueryPhrase"
          @input="store.jumpToPage(`FIRST`);"
        />
      </div>
    </div>
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      
      <HeaderOfColumns 
        :cols="{example: {isVisible: true,isTrExamplePairCol:true,}}"
        :isAllSelected="store.isAllSelected"
        :sortCol="store.sortCol"
        :sortAscending="store.sortAscending"
        @toggleSort="(colName: string) => store.toggleSort(colName)"
        @toggleAllSelection="store.toggleAllSelection()"
      />
      
      <DatatableBody
        :onePageOfEntries="store.onePageOfFilteredEntries"
        :columnDefinitions="{example: {isVisible: true,isTrExamplePairCol:true,}}"
        :displayColsAsRawString="false"
        :selectedIndices="store.selectedIndices"
        :highlightedTexts="store.phrasesUsedInHighlight"
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
        :options="store.resultsPerPageOptions" 
        :currently-selected="store.resultsPerPage"
        @input="(val: number) => {store.setResultsPerPage(val);store.jumpToPage(`FIRST`);scrollToTableTop();}"
        />
      <DtPagination 
        @jumpToPage="(pageJumpType: PageJumpType) => {store.jumpToPage(pageJumpType); scrollToTableTop();}" 
        :isFirstPage="store.isFirstPage"
        :isLastPage="store.isLastPage" 
        v-model="store.currentPageInputForTwoWayBinding"
        :isGivenInputAValidPage="store.currentPageInputField.valid"  
        >
      </DtPagination>
    </nav>
  </div>
  
</template>
<script setup lang="ts">
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

const store = useTranslationExampleStore()



const scrollToTableTop = (): void => {
    document.getElementById('datatable-table-top-anchor')?.scrollIntoView();
};

//debug celokra (pl. event) ideiglenesen behuzhato
//const log = (param: any) => console.log(param)

const toggleRowSelection = (index: number, $event: Event) => {
  ($event?.target as HTMLInputElement)?.checked ? store.selectedIndices.add(index): store.selectedIndices.delete(index)
} 

// initialize components based on data attribute selectors
onMounted(async () => {
  `TODO kell?`
})


</script>