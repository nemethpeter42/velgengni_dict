<template>
  <div>
    <div class="shadow-md sm:rounded-lg" id="datatable-table-top-anchor">
      <div class="flex flex-wrap items-center justify-between border-t-2 border-x-2 border-cyan-200 dark:border-indigo-900 sm:rounded-t-lg">
        <div class="my-1.5">
          
          <DictBulkActions />
          
        </div>
        <div class="flex my-1.5">
          <QuickSearch 
            :modelValue="store.quickSearchQueryPhrase"
            @update:modelValue="val => store.setQuickSearchQueryPhrase(val)"
            @input="store.jumpToPage(`FIRST`);"
          />
          <ShowConfigModalButton 
            @click="showConfigModal()"
          />
        </div>
      </div>
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        
        <HeaderOfColumns 
          :columnDefinitions="store.currDictVisibleCols"
          :isAllSelected="store.isAllSelected"
          :sortCol="store.sortCol"
          :sortAscending="store.sortAscending"
          @toggleSort="(colName: string) => store.toggleSort(colName)"
          @toggleAllSelection="store.toggleAllSelection()"
        />
        
        <DatatableBody
          :onePageOfEntries="store.onePageOfFilteredEntries"
          :columnDefinitions="store.currDictVisibleCols"
          :displayColsAsRawString="store.displayColsAsRawString"
          :selectedIndices="store.selectedIndices"
          @toggleRowSelection="(idx: number,$event: Event) => toggleRowSelection(idx,$event)"
        >
         <template #rowLevelButtons="{idx,sortedIdx,}">
            <ShowDetailsModalButton 
              @click="showDictEntryDetailsModal(sortedIdx)"
              />
            <span 
              v-if="store.displayRowNumbers"
              class="ml-3 w-10"
              >
              #{{ idx + 1 }}
            </span>
         </template>
         <template #detailRow="{ sortedIdx,preferredColspan,idxOnCurrPage,}">
            <tr
              :class="{
                [`bg-violet-300 dark:bg-violet-800 opacity-85`]: (idxOnCurrPage + index) % 2 === 0,
                [`bg-violet-200 dark:bg-violet-900 opacity-85`]: (idxOnCurrPage + index) % 2 !== 0,
              }"
              v-if="store.displaySavedExamples"
              v-for="(item,index) of store.nonLowPrioExamplesOfCurrDict[sortedIdx]"
              :key="index"
              >
              <td :colspan="preferredColspan">
                <DictTableSavedExampleRow 
                  :saved-example="item"
                />
                
              </td>
            </tr>
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
    
  </div>
</template>
<script lang="ts" setup>
import DtPagination from '@/components/datatable/DtPagination.vue'
import { useDictStore } from '@/stores/dict'
import { ref } from 'vue';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type PageJumpType } from '@/frontend_models/PageJumpType';
import DictBulkActions from '@/components/datatable/DictBulkActions.vue';
import QuickSearch from '@/components/datatable/QuickSearch.vue';
import PageSizeInput from './PageSizeInput.vue';
import HeaderOfColumns from './HeaderOfColumns.vue';
import ShowConfigModalButton from '../input-fields-and-buttons/ShowConfigModalButton.vue';
import ShowDetailsModalButton from '../input-fields-and-buttons/ShowDetailsModalButton.vue';
import DatatableBody from './DatatableBody.vue';
import { useModalStore } from '@/stores/modal';
import { useSavedTrExampleStore } from '@/stores/savedTrExample';
import DictTableSavedExampleRow from './DictTableSavedExampleRow.vue';

const store = useDictStore()

const scrollToTableTop = (): void => {
    document.getElementById(`datatable-table-top-anchor`)?.scrollIntoView();
};

//debug celokra (pl. event) ideiglenesen behuzhato
//const log = (param: any) => console.log(param)

const toggleRowSelection = (index: number, $event: Event) => {
  ($event?.target as HTMLInputElement)?.checked ? store.selectedIndices.add(index): store.selectedIndices.delete(index)
} 

//TODO 
// ideovel sajat modal komponenst letrehozni, 
// mert a flowbyte-vue komponense annyira rossz volt 
// (ablkmeret-csokkentesnel tulfut), 
// hogy helyette ide kiteritettem
const  modalStore = useModalStore();

const showDictEntryDetailsModal = (idx: number) => {
  store.setCurrentIdx(idx)
  modalStore.openModals.add(`DICT_ENTRY_DETAILS`)
}

function showConfigModal() {
  modalStore.openModals.add(`DICT_CONFIG`)
}

</script>