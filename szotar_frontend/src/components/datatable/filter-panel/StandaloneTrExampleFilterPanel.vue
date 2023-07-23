<template>
  
  <div class="flex m-1 max-w-3xl">
    <input 
      id="big-filter-input" 
      class="
        flex-1
        px-3 py-2 mx-1
        shadow-sm border block text-sm rounded-lg
        bg-gray-50 text-gray-900 border-gray-300 
        focus:ring-blue-500 focus:border-blue-500  
        dark:shadow-sm-light dark:placeholder-gray-400 
        dark:bg-gray-700 dark:text-white dark:border-gray-600 
        dark:focus:ring-blue-500 dark:focus:border-blue-500
      " 
      style="max-width: 48rem;"
      placeholder="Nagy szűrő"
      v-model="trExampleStore.bigFilterCurrVal"
      v-on:keyup.enter="trExampleStore.executeBigFilterQuery()"
      >
      <button 
        class="flex-0 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        @click="trExampleStore.executeBigFilterQuery()"
        > 
        <ArrowSmallRightIcon  class="w-6 h-6 fill-current"/>
      </button>
    
  </div>
    
  
  <div class="flex flex-wrap items-center">
    <div class="">
      <button 
        id="prevWordBtn"
        class="
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center 
          focus:outline-none focus:ring-4 focus:ring-orange-300 
          dark:focus:ring-orange-800
        "
        @click=" 
          async () => 
            {
              if(!wordListStore.isTheFirstWordActive){
                wordListStore.setCurrentIdx(wordListStore.currentIdx-1);
              }
            }"
        :class="{
          [`
            text-gray-500
            bg-orange-400 
            dark:bg-orange-800 
            cursor-not-allowed
          `]: wordListStore.isTheFirstWordActive,
          [`
            text-gray-100
            bg-orange-500 
            hover:bg-orange-600 
            dark:bg-orange-600 
            dark:hover:bg-orange-700 
          `]: !wordListStore.isTheFirstWordActive,
        }"
      >Előző</button>
    </div>
    <div class="">
      <button 
        id="nextWordBtn"
        class="
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center 
          focus:outline-none focus:ring-4 focus:ring-orange-300 
          dark:focus:ring-orange-800
        "
        @click=" 
          async () => 
            {
              if(!wordListStore.isTheLastWordActive){
                wordListStore.setCurrentIdx(wordListStore.currentIdx+1);
              }
            }"
        :class="{
          [`
            text-gray-500
            bg-orange-400 
            dark:bg-orange-800 
            cursor-not-allowed
          `]: wordListStore.isTheLastWordActive,
          [`
            text-gray-100
            bg-orange-500 
            hover:bg-orange-600 
            dark:bg-orange-600 
            dark:hover:bg-orange-700 
          `]: !wordListStore.isTheLastWordActive,
        }"


      >Következő</button>
    </div>
    <div class="">
      <button 
        id="wordListModalOpenBtn"
        class="
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center 
          text-white bg-orange-500 
          hover:bg-orange-600 
          focus:outline-none focus:ring-4 focus:ring-orange-300 
          dark:bg-orange-600 
          dark:hover:bg-orange-700 
          dark:focus:ring-orange-800
        "
        @click=" showWordListModal()"
      >Szóválasztó</button>
    </div>

    <div 
      @click="trExampleStore.setFilteringMode(`MARK_ONLY`)"
      class="
        flex items-center px-5 border rounded h-fit
        border-gray-200 
        dark:border-gray-700
      ">
      <input 
        :checked="trExampleStore.filteringMode === `MARK_ONLY`" 
        id="view-mode-highlight-only" 
        type="radio" 
        class="
          w-4 h-4 
          text-blue-600 bg-gray-100 border-gray-300 
          focus:ring-blue-500 focus:ring-2
          dark:bg-gray-700 dark:border-gray-600
          dark:focus:ring-blue-600 dark:ring-offset-gray-800 
        ">
      <label 
        for="view-mode-highlight-only" 
        class="
          w-full py-1 m-2 text-sm font-medium select-none 
          text-gray-900 
          dark:text-gray-300
        ">
        Csak kiemelés
      </label>
    </div>
    <div
      @click="trExampleStore.setFilteringMode(`FILTER`)"
      class="
        flex items-center px-5 border rounded h-fit
        border-gray-200 
        dark:border-gray-700
      ">
      <input 
        :checked="trExampleStore.filteringMode === `FILTER`" 
        id="view-mode-filter" 
        type="radio" 
        class="
          w-4 h-4 
          text-blue-600 bg-gray-100 border-gray-300 
          focus:ring-blue-500 focus:ring-2
          dark:bg-gray-700 dark:border-gray-600
          dark:focus:ring-blue-600 dark:ring-offset-gray-800 
        ">
        <label 
        for="view-mode-filter" 
        class="
          w-full py-1 m-2 text-sm font-medium select-none 
          text-gray-900 
          dark:text-gray-300
        ">
        Szűrés
      </label>
    </div>
    <div 
      @click="trExampleStore.setFilteringMode(`INVERSE_FILTER`)"
      class="
        flex items-center px-3 border rounded h-fit
        border-gray-200 
        dark:border-gray-700
      ">
      <input 
        :checked="trExampleStore.filteringMode === `INVERSE_FILTER`" 
        id="view-mode-inverted-filter" 
        type="radio" 
        class="
          w-4 h-4 
          text-blue-600 bg-gray-100 border-gray-300 
          focus:ring-blue-500 focus:ring-2
          dark:bg-gray-700 dark:border-gray-600
          dark:focus:ring-blue-600 dark:ring-offset-gray-800 
        ">
        <label 
        for="view-mode-inverted-filter" 
        class="
          w-full py-1 m-2 text-sm font-medium select-none 
          text-gray-900 
          dark:text-gray-300
        ">
        Inverz szűrés
      </label>
    </div>
  </div>
  <div>
    <GeneratedQuickAccessBtnList 
      :generator="Array.isArray(wordListStore.wordList) && wordListStore.currentIdx !== -1 ? wordListStore.wordList[wordListStore.currentIdx] : []"  
      :defaultNumOfDisplayedItems="10" 
      @quickAccessSelected="(selection: QuickAccessSelectionResult) => handleQuickAccessSelected(selection)" 
      :isAllDisplayed="wordListStore.isAllQuickAccessBtnVisible"
      @displayAll="wordListStore.isAllQuickAccessBtnVisible = true"
    />
  </div>
  <div>
    <SearchConditionEditor 
      v-model="trExampleStore.exampleFindReq.conditions" 
      />
  </div>
  <div class="flex flex-wrap">
    <div class="m-2">
      <TrExampleResultLimit 
        :options="[1000,3000,10000,20000]" 
        :currently-selected="trExampleStore.exampleFindReq.resultLimit" 
        @input="async (val: number) => {trExampleStore.setResultLimitForQuery(val);}"
        />  
    </div>
    <div class="m-2">
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Nyelvpár: </span><Dropdown>
          <template #trigger>
            <button 
              id="dropdownLangPair" 
              class="
                px-3 py-1.5 mx-2
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
              {{`${trExampleStore.exampleFindReq.lang1} - ${trExampleStore.exampleFindReq.lang2}`}}
              <ChevronDownIcon class="w-3 h-3 ml-2" />
            </button>
          </template>
          <ul class="
            overflow-hidden w-48 rounded-lg text-sm font-medium border 
            text-gray-900 bg-white border-gray-200 
            dark:bg-gray-700 dark:border-gray-600 dark:text-white
            ">
            <li 
              v-for="(item, index) in trExampleStore.languagePairs"
              :key="index"
              @click="trExampleStore.setLang1(item.lang1);trExampleStore.setLang2(item.lang2)"
              class="
                block px-4 py-2 inline-flex items-center w-full border-b cursor-pointer
                border-gray-200 
                hover:bg-gray-100 hover:text-blue-700 
                focus:outline-none focus:ring-2 focus:text-blue-700 
                dark:border-gray-600 
                dark:hover:bg-gray-600 dark:hover:text-white 
                dark:focus:ring-gray-500 dark:focus:text-white
              ">
              <div class="mr-2"><FlagIcon class="w-4 h-4 fill-current" /></div> {{`${item.lang1} - ${item.lang2}`}}
            </li>
          </ul>
        </Dropdown>
    </div>
  </div>
  <div class="flex flex-wrap">

    <div class="m-1">
      <button 
        id="executeSearchButton"
        class="
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center 
          text-white bg-blue-700 
          hover:bg-blue-800 
          focus:outline-none focus:ring-4 focus:ring-blue-300 
          dark:bg-blue-600 
          dark:hover:bg-blue-700 
          dark:focus:ring-blue-800
        "
        @click=" trExampleStore.refreshExampleList(trExampleStore.exampleFindReq, false)"
        >Keresés</button>
      <button 
        id="executeSearchAltLangButton"
        class="
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center
          text-gray-900 bg-white 
          border border-gray-200 
          hover:bg-gray-100 hover:text-blue-700 
          focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
          dark:bg-gray-800 dark:text-gray-400 
          dark:border-gray-600 
          dark:hover:text-white dark:hover:bg-gray-700
          dark:focus:ring-gray-700 
          "
          @click=" trExampleStore.refreshExampleList(trExampleStore.exampleFindReq, true)"
        >Másik nyelv</button>
    </div>
    <div class="flex items-center m-1">
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Kiemelés:&nbsp;</span>
    </div>
    <div class="flex items-center m-1"> 
      <input 
        id="is-query-lang-highligted-separately"
        type="checkbox" 
        v-model="trExampleStore.isQueryLangHighlightedSeparately"
        class="
          w-4 h-4 rounded 
          text-blue-600 bg-gray-100 border-gray-300
          focus:ring-2 
          focus:ring-blue-500 
          dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
          dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800 
        ">
      <label 
        for="is-query-lang-highligted-separately" 
        class="
          ml-2 text-sm font-medium 
          text-gray-900 
          dark:text-gray-300
        ">
        forrásnyelv külön
      </label>
    </div>
    <div class="flex items-center m-1"> 
      <input 
        id="is-query-lang-highligted-separately"
        type="checkbox" 
        v-model="trExampleStore.isQueryLangHighlightedJoined"
        class="
          w-4 h-4 rounded 
          text-blue-600 bg-gray-100 border-gray-300
          focus:ring-2 
          focus:ring-blue-500 
          dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
          dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800 
        ">
      <label 
        for="is-query-lang-highligted-joined" 
        class="
          ml-2 text-sm font-medium 
          text-gray-900 
          dark:text-gray-300
        ">
        forrásnyelv egyben
      </label>
    </div>
    <div class="flex items-center m-1"> 
      <input 
        id="is-query-lang-highligted-separately"
        type="checkbox" 
        v-model="trExampleStore.isResultLangHighlited"
        class="
          w-4 h-4 rounded 
          text-blue-600 bg-gray-100 border-gray-300
          focus:ring-2 
          focus:ring-blue-500 
          dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
          dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800 
        ">
      <label 
        for="is-result-lang-highligted-joined" 
        class="
          ml-2 text-sm font-medium 
          text-gray-900 
          dark:text-gray-300
        ">
        célnyelv
      </label>
    </div>
  </div>

  <div 
    v-if="wordListStore.currentIdx !== -1" 
    class="text-gray-800 dark:text-gray-200 font-bold text-lg mb-4 mx-2"
    >
    {{ wordListStore.wordList[wordListStore.currentIdx]?.join(`; `) }}
  </div>
  <div v-if="isWordListModalShown">
      <div class="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40"></div>
      <div id="defaultModal"  tabindex="-1" aria-hidden="true" :class="{flex: isWordListModalShown, hidden: !isWordListModalShown,}" class="fixed top-0 left-0 right-0 z-50 w-full p-4  overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center">
        <div class="relative w-full max-w-5xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- Modal body -->
            <div class="p-2 space-y-6">
              <WordListModalContent 
                @close="closeWordListModal()"
              />
            </div>
            <div class="flex justify-between p-2 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <div>
                <button @click="closeWordListModal()" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
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
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import WordListModalContent from '@/components/modal-content/WordListModalContent.vue'
  import {useWordListStore,} from '@/stores/wordList'
  import { Dropdown, } from 'flowbite-vue'
  import { ArrowSmallRightIcon, ChevronDownIcon, FlagIcon, } from '@heroicons/vue/24/solid'
  import TrExampleResultLimit from '@/components/input-fields/TrExampleResultLimit.vue';
  import { useTranslationExampleStore } from '@/stores/translationExample';
  import SearchConditionEditor from '@/components/input-fields/SearchConditionEditor.vue';
  import GeneratedQuickAccessBtnList from '@/components/input-fields/GeneratedQuickAccessBtnList.vue';
  import { QuickAccessSelectionResult } from '@/frontend_models/QuickAccessSelectionResult';
  import { SearchCondition } from '../../../../../libs/szotar_common/src/models/SearchCondition';
  const wordListStore = useWordListStore()
  const trExampleStore = useTranslationExampleStore()
  
  const isWordListModalShown = ref(false)
  function closeWordListModal() {
    isWordListModalShown.value = false
  }
  function showWordListModal() {
    isWordListModalShown.value = true
  }

  const handleQuickAccessSelected = async (selection: QuickAccessSelectionResult) => {
    const conditions = selection.words.map(
      expression => ({
        expression, 
        onlyWithSpaceDotOrCommaSuffix: selection.onlyWithSpaceDotOrCommaSuffix,
        onlyWithSpacePrefix: selection.onlyWithSpacePrefix,
      } as SearchCondition))
    await trExampleStore.resetSearchConditions(conditions)
    await trExampleStore.refreshExampleList(trExampleStore.exampleFindReq, selection.isInverseSearch)
  }
  
</script>