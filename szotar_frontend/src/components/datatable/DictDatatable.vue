<template>
  <div>
    <div class="shadow-md sm:rounded-lg" id="datatable-table-top-anchor">
      <div class="flex flex-wrap items-center justify-between border-t-2 border-x-2 border-cyan-200 dark:border-indigo-900 sm:rounded-t-lg">
        <div class="my-1.5">
          <ShowExportModalBtn 
            @click="modalStore.openModals.add(`EXPORT`)"
          />
          
        </div>
        <div class="flex my-1.5">
          <QuickSearch 
            :modelValue="store.quickSearchQueryPhrase"
            @update:modelValue="val => store.setQuickSearchQueryPhrase(val)"
            @input="store.jumpToPage(`FIRST`);"
            label="Gyorskeresés"
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
          :onePageOfEntries="store.currPageOfFilteredEntries"
          :columnDefinitions="store.currDictVisibleCols"
          :displayColsAsRawString="store.displayColsAsRawString"
          :selectedIndices="store.selectedIndices"
          :highlightedIndices="store.highlightedIndices"
          @toggleRowSelection="(idx: number,$event: Event) => toggleRowSelection(idx,$event)"
        >
        <template #rowLevelButtons="{idx,sortedIdx,idxOnCurrPage,}">
          <ShowDetailsModalButton 
            @click="showDictEntryDetailsModal(sortedIdx)"
            />
          <HighlightCurrEntryIconButton 
            v-if="store.displayHighlightButtons"
            @click="
              store.highlightedIndices.has(idx) ? 
              store.highlightedIndices.delete(idx) :
              store.highlightedIndices.add(idx)"
            />
          <div class="flex flex-col items-end">
            <div 
              v-if="store.displayRowNumbers"
              class="ml-3 w-10">
              #{{ idx + 1 }}
            </div>
            <div
              class="ml-3 w-12 text-right"
              v-if="store.frequencySearchResult[idxOnCurrPage]!==undefined">
              ({{ store.frequencySearchResult[idxOnCurrPage] }})
            </div>
          </div>
        </template>
        <template #detailRow="{ sortedIdx,preferredColspan,idxOnCurrPage,}">
            <tr
              :class="{
                [`even-tr-example-row opacity-90`]: (idxOnCurrPage + index) % 2 === 0,
                [`odd-tr-example-row opacity-90`]: (idxOnCurrPage + index) % 2 !== 0,
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
import ShowExportModalBtn from '../input-fields-and-buttons/ShowExportModalBtn.vue';
import HighlightCurrEntryIconButton from '../input-fields-and-buttons/HighlightCurrEntryIconButton.vue';

const store = useDictStore(`dictModule`)

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
<style scoped>
  .even-tr-example-row{
    background-color: rgb(207, 194, 254);
  }

  .even-tr-example-row:is(.dark *) {
    background-color: rgb(86, 39, 161);
  }
  
  .odd-tr-example-row {
    background-color: rgb(221, 214, 254);
  }

  .odd-tr-example-row:is(.dark *) {
    background-color: rgb(76, 29, 149);
  }
</style>