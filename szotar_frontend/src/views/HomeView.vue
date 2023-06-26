<template>
  <div class="max-w-7xl m-auto home-page">
    <DictFilterPanel />
    <div class="shadow-md sm:rounded-lg" id="datatable-table-top-anchor">
      <div class="flex flex-wrap items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div class="my-1.5">
          
          <DictBulkActions />
          
        </div>
        <div class="flex my-1.5">
          <QuickSearch 
            v-model="store.quickSearchQueryPhrase"
            @input="store.jumpToPage(`FIRST`);"
          />
          <button 
              type="button" 
              @click="showConfigModal()"
              class="
                px-3 py-2 mx-2
                font-medium rounded-lg text-sm 
                text-white bg-blue-700 hover:bg-blue-800 
                focus:ring-4 focus:ring-blue-300 focus:outline-none 
                dark:bg-blue-600 dark:hover:bg-blue-700 
                dark:focus:ring-blue-800
              ">
              <WrenchScrewdriverIcon class="h-4 w-4 text-gray-100" />
            </button>
        </div>
      </div>
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="
          text-xs uppercase
          text-gray-700 bg-gray-100 
          dark:bg-gray-700 dark:text-gray-400
          ">
          <tr>
            <th scope="col" class="p-4">
              <div class="flex items-center">
                <input id="checkbox-all-search" type="checkbox"
                  :checked="store.isAllSelected"
                  @click="store.toggleAllSelection()"
                  class="
                    w-4 h-4 border-double border-4 rounded
                    text-fuchsia-600 bg-gray-100 border-gray-300 
                    focus:ring-fuchsia-500 focus:ring-2 
                    dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
                    dark:focus:ring-fuchsia-600 dark:focus:ring-offset-gray-800"
                    >
                <label for="checkbox-all-search" class="sr-only">checkbox</label>
              </div>
            </th>
            <th 
              scope="col" 
              class="px-2.5 py-3"
              v-for="(colDef,colName) of store.currDictVisibleCols" v-bind:key="colName"
            >
              {{colName}}
            </th>
            <th scope="col" class="px-6 py-3">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, rowIndex) in store.onePageOfFilteredEntries" 
            v-bind:key="item.idx" 
            class="
              border-b
              
            "
            :class="{
              [`
                bg-gray-50 
                hover:bg-gray-200
                dark:bg-gray-900 dark:border-gray-700 
                dark:hover:bg-gray-600
              `]: rowIndex % 2 === 0,
              [`
                bg-gray-100
                hover:bg-gray-200
                dark:bg-gray-800 dark:border-gray-700 
                dark:hover:bg-gray-600
              `]: rowIndex % 2 !== 0,
              }"
            >
            <td class="w-4 pl-4 pr-2 py-2">
              <div class="flex items-center">
                <input type="checkbox"
                  @click="toggleRowSelection(item.idx,$event)"
                  :checked="store.selectedIndices.has(item.idx)"
                  class="
                    select-row-checkbox w-4 h-4 rounded 
                    text-fuchsia-600 bg-gray-100 border-gray-300 
                    focus:ring-fuchsia-500 focus:ring-2 
                    dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
                    dark:focus:ring-fuchsia-600 dark:focus:ring-offset-gray-800
                  ">
                  <button 
                    type="button" 
                    @click="showDetailsModal()"
                    class="
                      px-2 py-2 ml-4 mr-1
                      font-medium rounded-lg text-sm 
                      text-white bg-blue-700 hover:bg-blue-800 
                      focus:ring-4 focus:ring-blue-300 focus:outline-none 
                      dark:bg-blue-600 dark:hover:bg-blue-700 
                      dark:focus:ring-blue-800
                    ">
                    <Bars3Icon class="h-4 w-4 text-gray-100" />
                  </button>
                <label for="select-row-checkbox" class="sr-only">Sor kiválasztása</label>
              </div>
            </td>
            <td scope="row" class="px-2.5 py-2 font-medium text-gray-900 dark:text-gray-100" v-for="(colDef,colName) of store.currDictVisibleCols" v-bind:key="colName" :class="colDef?.tailwindClasses ?? ``">
              <MeaningForestViewer v-if="colDef.isMeaningForestCol" :raw-val="item.val.translated" :display-cols-as-raw-string="store.displayColsAsRawString" />
              <div v-else>{{item.val[colName]}}</div>
            </td>
            <td class="
              px-6 py-2 max-w-40 font-medium 
              text-gray-800 
              dark:text-gray-200
            ">
              <!---{{item.val.translated}}-->
              
            </td>
          </tr>
        </tbody>
      </table>
      <nav class="flex items-center justify-between py-3 px-2" aria-label="Table navigation">
        <div class="text-sm font-normal text-gray-500 dark:text-gray-400"> 
          Lapméret: <span
            class="font-semibold text-gray-900 dark:text-white">
            <select 
              id="pagesize" 
              class="
                w-20 p-2 text-sm border rounded-lg 
                text-gray-900 border-gray-300 bg-gray-50 
                focus:ring-blue-500 focus:border-blue-500 
                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                dark:focus:ring-blue-500 dark:focus:border-blue-500
              "
            >
              <option 
                v-for="val in store.resultsPerPageOptions" 
                v-bind:key="val" 
                :selected="store.resultsPerPage===val" 
                @click="setResultsPerPage(val);store.jumpToPage(`FIRST`);scrollToTableTop();"
                >{{val}}</option>
            </select>
          </span>
        </div>
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
  <Modal size="7xl" v-if="isDetailsModalShown" @close="closeDetailsModal()">
        <template #header>
          <div class="flex items-center text-lg text-gray-700 dark:text-gray-300">
            Terms of Service
          </div>
        </template>
        <template #body>
          <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
          </p>
          <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
          </p>
        </template>
        <template #footer>
          <div class="flex justify-between">
            <button @click="closeDetailsModal()" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
              Decline
            </button>
            <button @click="closeDetailsModal()" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              I accept
            </button>
          </div>
        </template>
      </Modal>
      <Modal size="5xl" v-if="isConfigModalShown" @close="closeConfigModal()">
        <template #header>
          <div class="flex items-center text-lg text-gray-700 dark:text-gray-300">
            Táblázat beállításai
          </div>
        </template>
        <template #body>
          <TableConfiguration />
        </template>
        <template #footer>
          <div class="flex justify-between">
            <div>
              <button @click="closeConfigModal()" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                Bezárás
              </button>
            </div>
            <div>
              
            </div>
          </div>
        </template>
      </Modal>

  
</template>

<script setup lang="ts">
import { Modal, } from 'flowbite-vue'
import DtPagination from '../components/datatable/DtPagination.vue'
import { Bars3Icon, WrenchScrewdriverIcon } from '@heroicons/vue/24/solid'
import { useDictStore } from '@/stores/dict'
import { onMounted, ref } from 'vue';
import MeaningForestViewer from '@/components/meaning-forest/MeaningForestViewer.vue';
import TableConfiguration from '@/components/datatable/TableConfiguration.vue';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PageJumpType } from '@/frontend_models/PageJumpType';
import DictFilterPanel from '@/components/datatable/filter-panel/DictFilterPanel.vue';
import DictBulkActions from '@/components/datatable/DictBulkActions.vue';
import QuickSearch from '@/components/datatable/QuickSearch.vue';

const store = useDictStore()

async function setResultsPerPage(val: number){
  await store.setResultsPerPage(val)
}


const scrollToTableTop = (): void => {
    document.getElementById('datatable-table-top-anchor')?.scrollIntoView();
};

//debug celokra (pl. event) ideiglenesen behuzhato
//const log = (param: any) => console.log(param)

const toggleRowSelection = (index: number, $event: Event) => {
  ($event?.target as HTMLInputElement)?.checked ? store.selectedIndices.add(index): store.selectedIndices.delete(index)
} 


const isDetailsModalShown = ref(false)
const isConfigModalShown = ref(false)
function closeDetailsModal() {
  isDetailsModalShown.value = false
}
function showDetailsModal() {
  isDetailsModalShown.value = true
}
function closeConfigModal() {
  isConfigModalShown.value = false
}
function showConfigModal() {
  isConfigModalShown.value = true
}

// initialize components based on data attribute selectors
onMounted(async () => {
  await store.refreshDictMetas()
})



</script>

<style lang="scss">

</style>