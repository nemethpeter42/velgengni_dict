<template>
  <div>
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
              @click="showDetailsModal(sortedIdx)"
              />
            <span 
              v-if="store.displayRowNumbers"
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
    
    <div v-if="isDetailsModalShown">
      <div class="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40"></div>
      <div 
        id="detailsModal"  
        data-backdrop-for="detailsModal"
        @click="$event => detailsModalBackdrop($event)"
        tabindex="-1" 
        aria-hidden="true" 
        :class="{flex: isDetailsModalShown, hidden: !isDetailsModalShown,}" 
        class="fixed top-0 left-0 right-0 z-50 w-full p-4  overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center"
        >
        <div class="relative w-full max-w-7xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div class="p-6 space-y-6">
              <DictEntryDetailsModalContent />
            </div>
            <div class="flex justify-between p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <div>
                <button @click="closeDetailsModal()" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                  Bezárás
                </button>
              </div>
              <div>
                  
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isConfigModalShown">
      <div class="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40"></div>
      <div 
        id="configModal"  
        data-backdrop-for="configModal"
        @click="$event => configModalBackdrop($event)"
        tabindex="-1" 
        aria-hidden="true" 
        :class="{flex: isConfigModalShown, hidden: !isConfigModalShown,}" 
        class="fixed top-0 left-0 right-0 z-50 w-full p-4  overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center"
        >
        <div class="relative w-full max-w-5xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
              <div class="flex items-center text-lg text-gray-700 dark:text-gray-300">
                Táblázat beállításai
              </div>
            </div>
            <!-- Modal body -->
            <div class="p-6 space-y-6">
              <TableConfiguration />
            </div>
            <div class="flex justify-between p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <div>
                <button @click="closeConfigModal()" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                  Bezárás
                </button>
              </div>
              <div>
                  
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>
<script lang="ts" setup>
import DtPagination from '@/components/datatable/DtPagination.vue'
import { useDictStore } from '@/stores/dict'
import { ref } from 'vue';
import TableConfiguration from '@/components/modal-content/TableConfiguration.vue';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PageJumpType } from '@/frontend_models/PageJumpType';
import DictBulkActions from '@/components/datatable/DictBulkActions.vue';
import QuickSearch from '@/components/datatable/QuickSearch.vue';
import PageSizeInput from './PageSizeInput.vue';
import HeaderOfColumns from './HeaderOfColumns.vue';
import ShowConfigModalButton from '../input-fields-and-buttons/ShowConfigModalButton.vue';
import ShowDetailsModalButton from '../input-fields-and-buttons/ShowDetailsModalButton.vue';
import DatatableBody from './DatatableBody.vue';
import DictEntryDetailsModalContent from '../modal-content/DictEntryDetailsModalContent.vue';

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

const isDetailsModalShown = ref(false)
function closeDetailsModal() {
  isDetailsModalShown.value = false
}
function showDetailsModal(idx: number) {
  console.log(`TODO showDetailsModal ${idx}`)
  store.setCurrentIdx(idx)
  isDetailsModalShown.value = true
}

const isConfigModalShown = ref(false)
function closeConfigModal() {
  isConfigModalShown.value = false
}
function showConfigModal() {
  isConfigModalShown.value = true
}

function detailsModalBackdrop($event: any) {
  try {
    const attributes = 
      [...$event?.originalTarget?.attributes]?.
        map(e=>({name: e.name, value: e.value})) as {name: string, value: string}[];
    if (attributes.filter(e=>e.name===`data-backdrop-for`,`detailsModal`).length > 0) {
      isDetailsModalShown.value = false
    }
    $event.stopPropagation();
  } catch(e) {
    /* eslint-disable no-empty */
    //TODO: 
    // normalisan visszafejteni es 
    // csak az "attributes" lekeresenel jelentkezo hibat szurni
  }
}

function configModalBackdrop($event: any) {
  try {
    const attributes = 
      [...$event?.originalTarget?.attributes]?.
        map(e=>({name: e.name, value: e.value})) as {name: string, value: string}[];
    if (attributes.filter(e=>e.name===`data-backdrop-for`,`configModal`).length > 0) {
      isConfigModalShown.value = false
    }
    $event.stopPropagation();
  } catch(e) {
    /* eslint-disable no-empty */
  }
}
</script>