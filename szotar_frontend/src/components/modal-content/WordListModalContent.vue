<template>
  <div>
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      
      <HeaderOfColumns
        :disableAllSelection="true" 
        :columnDefinitions="[{colName:`word`, colDef:{isVisible: true,}}]"
        :isAllSelected="false"
        :sortCol="store.sortCol"
        :sortAscending="store.sortAscending"
        @toggleSort="(colName: string) => store.toggleSort(colName)"
      />
        

      <DatatableBody
        :disableRowSelectionCheckbox="true"
        :onePageOfEntries="store.currPageOfFilteredEntries"
        :columnDefinitions="[{colName:`word`, colDef:{isVisible: true,}}]"
        :displayColsAsRawString="false"
        :selectedIndices="new Set()"
        :highlightedIndices="new Set()"
      >
        <template #rowLevelButtons="{idx,}">
          <span class="w-10">#{{ idx + 1 }}</span>
          <SelectWordButton 
            :idx="idx"
            @wordSelected="(idx: number) => {store.setCurrentIdx(idx); $emit(`close`)}"
            />
          <span class="text-red-400" v-if="store.prioImportantWords.includes(idx)"><b>(a)</b></span>
          <span class="text-red-400" v-if="store.prioAverageWords.includes(idx)"><b>(.)</b></span>
          <span class="text-red-400" v-if="store.prioRareWords.includes(idx)"><b>(n)</b></span>
        </template>
      </DatatableBody>
    </table>
    <nav class="
          py-3 px-2
          flex items-center justify-between flex-wrap
          border-b-2 border-x-2 
          border-cyan-200 
          dark:border-indigo-900
          sm:rounded-b-lg
        " 
        aria-label="Table navigation"
        >
        <QuickSearch 
          :modelValue="store.quickSearchQueryPhrase"
          @update:modelValue="val => store.setQuickSearchQueryPhrase(val)"
          @input="store.jumpToPage(`FIRST`);"
          label="Gyorskeresés"
          />
        <PageSizeInput 
          :options="store.resultsPerPageOptions" 
          :currently-selected="store.resultsPerPage"
          @input="(val: number) => {store.setResultsPerPage(val);store.jumpToPage(`FIRST`);}"
          />
        <DtPagination 
          @jumpToPage="(pageJumpType: PageJumpType) => {store.jumpToPage(pageJumpType);}" 
          :isFirstPage="store.isFirstPage"
          :isLastPage="store.isLastPage" 
          v-model="store.currentPageInputForTwoWayBinding"
          :isGivenInputAValidPage="store.currentPageInputField.valid"  
          >
        </DtPagination>
      </nav>
      
  </div>
</template>
<script lang="ts" setup>
  import SelectWordButton from '@/components/input-fields-and-buttons/SelectWordButton.vue'
  import DtPagination from '../datatable/DtPagination.vue';
  import PageSizeInput from '../datatable/PageSizeInput.vue';
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  import { type PageJumpType } from '@/frontend_models/PageJumpType';
  import DatatableBody from '../datatable/DatatableBody.vue';
  import {useWordListStore,} from '@/stores/wordList'
  import HeaderOfColumns from '../datatable/HeaderOfColumns.vue';
  import QuickSearch from '../datatable/QuickSearch.vue';
  const store = useWordListStore()
</script>