<template>
  <div class="max-w-7xl m-auto home-page">
    <div class="flex">
      <div class="m-2"> 
        <label for="command" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Keresési parancs:</label>
        <textarea 
          id="command" 
          rows="3" 
          class="
            block p-2.5 w-96 text-sm rounded-lg resize-none
            text-gray-900 bg-gray-50
            border border-gray-300 
            focus:ring-blue-500 focus:border-blue-500 
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
            dark:focus:ring-blue-500 dark:focus:border-blue-500 
          " 
          placeholder='Pl. e.original===`cat`'
          v-model="store.backendSearchQuery"
        ></textarea>
      </div>
      <div class="m-2">
        <label for="command" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Szótár:</label>
        <select 
          id="dictName" 
          class="
            w-80 p-2 mb-6 text-sm border rounded-lg 
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
            @click="setResultsPerPage(val);store.jumpToFirstPage();scrollToTableTop();"
            >{{val}}</option>
        </select>
      </div>
    </div>

    <button 
      class="
        m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center 
        text-white bg-blue-700 
        hover:bg-blue-800 
        focus:outline-none focus:ring-4 focus:ring-blue-300 
        dark:bg-blue-600 
        dark:hover:bg-blue-700 
        dark:focus:ring-blue-800
      "
      @click=" executeBackendSearch()"
    >Keresés</button>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg" id="datatable-table-top-anchor">
      <div class="flex items-center justify-between pb-4 bg-white dark:bg-gray-900">
        <div>
          
          
          <dropdown text="Tömeges műv.">
            <template #trigger>
              <button 
                id="dropdownActionButton" 
                class="
                  px-3 py-1.5 
                  inline-flex items-center font-medium rounded-lg text-sm  
                  text-gray-500 bg-white 
                  border border-gray-300 
                  focus:outline-none focus:ring-4 focus:ring-gray-200
                  hover:bg-gray-100 
                  dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 
                  dark:hover:bg-gray-700 dark:hover:border-gray-600 
                  dark:focus:ring-gray-700
                "
                type="button">
                <span class="sr-only">Tömeges műveletek</span>
                Tömeges műv.
                <ChevronDownIcon class="w-3 h-3 ml-2" />
              </button>
            </template>
            <ul class="
              overflow-hidden w-48 rounded-lg text-sm font-medium border 
              text-gray-900 bg-white border-gray-200 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white
              ">
              <li class="
                block px-4 py-2 inline-flex items-center w-full border-b cursor-pointer
                border-gray-200 
                hover:bg-gray-100 hover:text-blue-700 
                focus:outline-none focus:ring-2 focus:text-blue-700 
                dark:border-gray-600 
                dark:hover:bg-gray-600 dark:hover:text-white 
                dark:focus:ring-gray-500 dark:focus:text-white
                ">
                <div class="mr-2"><CloudArrowDownIcon class="w-4 h-4 fill-current" /></div> Interaktív HTML export
              </li>
            </ul>
          </dropdown>
        </div>
        <label for="table-search" class="sr-only">Search</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true"/>
          </div>
          <input 
            type="text"  
            id="table-search-users"
            class="
              block p-2 pl-10 w-80 text-sm border rounded-lg
              text-gray-900 border-gray-300 bg-gray-50 
              focus:ring-blue-500 focus:border-blue-500 
              dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
              dark:focus:ring-blue-500 dark:focus:border-blue-500
            "
            placeholder="Gyorskeresés"
            v-model="store.quickSearchQueryPhrase"
            @input="store.jumpToFirstPage()"
            >
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
                    text-blue-600 bg-gray-100 border-gray-300 
                    focus:ring-blue-500 focus:ring-2 
                    dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
                    dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800"
                    >
                <label for="checkbox-all-search" class="sr-only">checkbox</label>
              </div>
            </th>
            <th scope="col" class="px-6 py-3">
              Original
            </th>
            <th scope="col" class="px-6 py-3">
              Translated
            </th>
            <th scope="col" class="px-6 py-3">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in store.onePageOfFilteredEntries" 
            v-bind:key="index" 
            class="
              border-b
              
            "
            :class="{
              [`
                bg-gray-50 
                hover:bg-gray-200
                dark:bg-gray-900 dark:border-gray-700 
                dark:hover:bg-gray-600
              `]: index % 2 === 0,
              [`
                bg-gray-100
                hover:bg-gray-200
                dark:bg-gray-800 dark:border-gray-700 
                dark:hover:bg-gray-600
              `]: index % 2 !== 0,
              }"
            >
            <td class="w-4 px-4 py-2">
              <div class="flex items-center">
                <input id="select-row-checkbox" type="checkbox"
                  @click="toggleRowSelection(index,$event)"
                  :checked="store.selectedIndices.has(index)"
                  class="
                    w-4 h-4 rounded 
                    text-blue-600 bg-gray-100 border-gray-300 
                    focus:ring-blue-500 focus:ring-2 
                    dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
                    dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800
                  ">
                <label for="select-row-checkbox" class="sr-only">Sor kiválasztása</label>
              </div>
            </td>
            <td scope="row" class="px-6 py-2 font-medium text-gray-900 dark:text-gray-100">
              {{item.original}}
            </td>
            <td class="
              px-6 py-2 max-w-40 font-medium 
              text-gray-800 
              dark:text-gray-200
            ">
              {{item.translated}}
            </td>
            <td class="px-6 py-2 flex items-center">
              <button 
                type="button" 
                @click="showDetailsModal()"
                class="
                  px-2 py-2 
                  font-medium rounded-lg text-sm 
                  text-white bg-blue-700 hover:bg-blue-800 
                  focus:ring-4 focus:ring-blue-300 focus:outline-none 
                  dark:bg-blue-600 dark:hover:bg-blue-700 
                  dark:focus:ring-blue-800
                ">
                <Bars3Icon class="h-4 w-4 text-gray-100" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <nav class="flex items-center justify-between pt-4" aria-label="Table navigation">
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400"> Lapméret: <span
            class="font-semibold text-gray-900 dark:text-white">
        <select 
          id="pagesize" 
          class="
            w-20 p-2 mb-6 text-sm border rounded-lg 
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
            @click="setResultsPerPage(val);store.jumpToFirstPage();scrollToTableTop();"
            >{{val}}</option>
        </select>
        </span></span>
        <ul class="inline-flex items-center -space-x-px">
          <li>
            <span class="sr-only">First</span>
            <button 
              aria-hidden="true"
              @click="store.jumpToFirstPage();scrollToTableTop()"
              :disabled="store.isFirstPage"
              class="
                px-3 py-2 
                leading-tight border
              "
              :class="{
                [`
                  cursor-not-allowed 
                  text-gray-300 dark:text-gray-700
                `]: store.isFirstPage, 
                [`
                 bg-white border-gray-300 text-gray-500 
                 hover:bg-gray-100 hover:text-gray-700 
                 dark:bg-gray-800 dark:border-gray-700 
                 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white
                `]: !store.isFirstPage,
              }"
              >&#x23EE;</button>
          </li>
          <li>
            <span class="sr-only">Previous</span>
            <button
              aria-hidden="true"
              @click="store.jumpToPreviousPage();scrollToTableTop()"
              :disabled="store.isFirstPage"
              class="px-3 py-2 leading-tight border"
              :class="{
                [`
                  cursor-not-allowed 
                  text-gray-300 dark:text-gray-700
                `]: store.isFirstPage, 
                [`
                 bg-white border-gray-300 text-gray-500 
                 hover:bg-gray-100 hover:text-gray-700 
                 dark:bg-gray-800 dark:border-gray-700 
                 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white
                 `]: !store.isFirstPage,
              }"
              >&#x23F4;</button>
          </li>
          <li class="z-10">
            <input 
              aria-current="page"
              class="
                px-3 py-2 w-16 
                leading-tight border border-dashed 
              "
              v-model='store.currentPageInputForTwoWayBinding' 
              :class="{ 
                [`
                  text-blue-600 border-blue-300 bg-blue-50 
                  hover:bg-blue-100 hover:text-blue-700 
                  dark:text-white dark:border-gray-700 dark:bg-gray-700   
                `]: store.currentPageInputField.valid,
                [`
                  text-red-600 border-red-300 bg-red-50 
                  hover:bg-red-100 hover:text-red-700 
                  dark:text-white dark:border-red-700 dark:bg-red-700   
                `]: !store.currentPageInputField.valid,
              }"
              >
          </li>
          <li>
            <span class="sr-only">Next</span>
            <button 
              aria-hidden="true"
              @click="store.jumpToNextPage();scrollToTableTop()"
              :disabled="store.isLastPage"
              class="px-3 py-2 leading-tight border"
              :class="{
                [`
                  cursor-not-allowed 
                  text-gray-300 dark:text-gray-700
                `]: store.isLastPage, 
                [`
                 bg-white border-gray-300 text-gray-500 
                 hover:bg-gray-100 hover:text-gray-700 
                 dark:bg-gray-800 dark:border-gray-700 
                 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white
                `]: !store.isLastPage,
              }"
              >&#x23F5;</button>
          </li>
          <li>
            <span class="sr-only">Last</span>
            <button 
              aria-hidden="true"
              @click="store.jumpToLastPage();scrollToTableTop()"
              :disabled="store.isLastPage"
              class="px-3 py-2 leading-tight border"
              :class="{
                [`
                  cursor-not-allowed 
                  text-gray-300 dark:text-gray-700
                `]: store.isLastPage, 
                [`
                 bg-white border-gray-300 text-gray-500 
                 hover:bg-gray-100 hover:text-gray-700 
                 dark:bg-gray-800 dark:border-gray-700 
                 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white
                `]: !store.isLastPage,
              }"
              >&#x23ED;</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
  <Modal size="7xl" v-if="isDetailsModalShown" @close="closeDetailsModal()">
        <template #header>
          <div class="flex items-center text-lg">
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
  
</template>

<script setup lang="ts">
import { Dropdown, Modal, } from 'flowbite-vue'
import { Bars3Icon, ChevronDownIcon, CloudArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import { useDictStore } from '@/stores/dict'
import { onMounted, ref } from 'vue';

const store = useDictStore()

async function executeBackendSearch() {
  await store.refreshEntries()
  store.jumpToFirstPage()
}

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
function closeDetailsModal() {
  isDetailsModalShown.value = false
}
function showDetailsModal() {
  isDetailsModalShown.value = true
}

// initialize components based on data attribute selectors
onMounted(async () => {
  await store.refreshDictMetas()
})
</script>

<style lang="scss"></style>