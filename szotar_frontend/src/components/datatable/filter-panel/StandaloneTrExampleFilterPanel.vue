<template>
  
  <div
    class="
        relative flex max-w-[90rem] m-auto flex-col 
        lg:flex-row
      "
    >
    <DtSpinner
      v-if="trExampleStore.isLoading" 
      test-id="standalone-tr-example-filter-panel-top"
    />
    <div 
      class="lg:grow-0 lg:pr-1 lg:border-r-4 border-gray-200 dark:border-gray-800 border-dashed"
      >
      <BigFilterInput
        v-model="trExampleStore.bigFilterInputFieldVal"
        @goButtonClicked="trExampleStore.executeBigFilterQuery()"
      />
      
        
      <div class="flex flex-wrap items-center">
        <WordListPrevNextButton 
          text="Előző" 
          id="prevWordBtn"
          :isDisabled="wordListStore.isTheFirstEntryActive" 
          @click=" 
            async () => 
              {
                if(!wordListStore.isTheFirstEntryActive){
                  wordListStore.setCurrentIdx(wordListStore.currentIdx-1);
                }
              }"
          />
        <WordListPrevNextButton 
          text="Következő" 
          id="nextWordBtn"
          :isDisabled="wordListStore.isTheLastEntryActive" 
          @click=" 
            async () => 
              {
                if(!wordListStore.isTheLastEntryActive){
                  wordListStore.setCurrentIdx(wordListStore.currentIdx+1);
                }
              }"
          />
        <WordListPrevNextButton 
          text="Szóválasztó" 
          id="wordListModalOpenBtn"
          @click=" showWordListModal()"
          />

        <FilteringModeOption 
          :is-checked="trExampleStore.filteringMode === `MARK_ONLY`" 
          label-text="Csak kiemelés"
          id-value="view-mode-mark-only"
          @click="trExampleStore.setFilteringMode(`MARK_ONLY`)"
         />
         
        <FilteringModeOption 
          :is-checked="trExampleStore.filteringMode === `FILTER`" 
          :label-text="`\u00A0\u00A0Szűrés\u00A0\u00A0`"
          id-value="view-mode-filter"
          @click="trExampleStore.setFilteringMode(`FILTER`)"
         />

         <FilteringModeOption 
          :is-checked="trExampleStore.filteringMode === `INVERSE_FILTER`" 
          label-text="Inverz szűrés"
          id-value="view-mode-inverted-filter"
          @click="trExampleStore.setFilteringMode(`INVERSE_FILTER`)"
         />

        
      </div>
      <div>
        <GeneratedQuickAccessBtnList 
          :generator="
            Array.isArray(wordListStore.wordList) && wordListStore.currentIdx !== -1 ? 
            wordListStore.wordList[wordListStore.currentIdx] : 
            []"  
          :defaultNumOfDisplayedItems="10" 
          @quickAccessSelected="(selection: QuickAccessSelectionResult) => handleQuickAccessSelected(selection)" 
          :isAllDisplayed="wordListStore.isAllQuickAccessBtnVisible"
          @displayAll="wordListStore.setIsAllQuickAccessBtnVisible(true)"
        />
      </div>

    </div>
    <div class="lg:grow lg:ml-3">
      <div>
        <SearchConditionEditor 
          v-model="trExampleStore.exampleFindReq.conditions" 
          />
      </div>
      <div class="flex flex-wrap">
        <div class="m-1">
          <TrExampleResultLimit 
            :options="[1000,3000,10000,20000]" 
            :currently-selected="trExampleStore.exampleFindReq.resultLimit" 
            @input="async (val: number) => {trExampleStore.setResultLimitForQuery(val);}"
            />  
        </div>
        <div class="m-1">
          <LanguagePairDropdown 
              :toggleBtnText="`${trExampleStore.exampleFindReq.lang1} - ${trExampleStore.exampleFindReq.lang2}`"
              :languagePairs="trExampleStore.languagePairs"
              idOfToggleBtn="dropdownLangPairToggleBtn"
              idOfOptionList="dropdownLangPairOptions"
              @optionSelected="(lang1: string, lang2: string) => {
                trExampleStore.setLang1(lang1);
                trExampleStore.setLang2(lang2);
              }"
            />
           
        </div>
      </div>
    </div>
  </div>
  <div class="relative flex flex-wrap max-w-6xl m-auto">
    <DtSpinner
      v-if="trExampleStore.isLoading" 
      test-id="standalone-tr-example-filter-panel-bottom"
    />

    <div class="m-1">
      <ExampleSearchButton
        @click=" trExampleStore.refreshExampleList(trExampleStore.exampleFindReq, false)"
      />
      <ExampleSearchAltLangButton
        @click=" trExampleStore.refreshExampleList(trExampleStore.exampleFindReq, true)"
      />
      
      
    </div>
    <div class="flex items-center m-1">
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Kiemelés:&nbsp;</span>
    </div>
    <HighlightModeOption 
      v-model="trExampleStore.isQueryLangHighlightedSeparately"
      idValue="is-query-lang-highligted-separately"
      labelText="forrásnyelv külön"
    />
    <HighlightModeOption 
      v-model="trExampleStore.isQueryLangHighlightedJoined"
      idValue="is-query-lang-highligted-joined"
      labelText="forrásnyelv egyben"
    />
    <HighlightModeOption 
      v-model="trExampleStore.isResultLangHighlited"
      idValue="is-result-lang-highligted"
      labelText="célnyelv"
    />
  </div>

 
  <div v-if="isWordListModalShown">
      <div class="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40"></div>
      <div 
        id="wordListModal"  
        data-backdrop-for="wordListModal"
        @click="$event => wordListModalBackdrop($event)"
        tabindex="-1" 
        aria-hidden="true" 
        :class="{flex: isWordListModalShown, hidden: !isWordListModalShown,}" 
        class="fixed top-0 left-0 right-0 z-50 w-full p-4  overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center"
        >
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

<script lang="ts" setup>
  import { ref } from 'vue';
  import DtSpinner from "../DtSpinner.vue"
  import WordListModalContent from '@/components/modal-content/WordListModalContent.vue'
  import {useWordListStore,} from '@/stores/wordList'
  import TrExampleResultLimit from '@/components/input-fields-and-buttons/TrExampleResultLimit.vue';
  import ExampleSearchButton from '@/components/input-fields-and-buttons/ExampleSearchButton.vue';
  import { useTranslationExampleStore } from '@/stores/translationExample';
  import SearchConditionEditor from '@/components/input-fields-and-buttons/SearchConditionEditor.vue';
  import GeneratedQuickAccessBtnList from '@/components/input-fields-and-buttons/GeneratedQuickAccessBtnList.vue';
  import BigFilterInput from '@/components/input-fields-and-buttons/BigFilterInput.vue';
  import { QuickAccessSelectionResult } from '@/frontend_models/QuickAccessSelectionResult';
  import { SearchCondition } from '../../../../../libs/szotar_common/src/models/SearchCondition';
  import ExampleSearchAltLangButton from '@/components/input-fields-and-buttons/ExampleSearchAltLangButton.vue';
  import WordListPrevNextButton from '@/components/input-fields-and-buttons/WordListPrevNextButton.vue';
  import FilteringModeOption from '@/components/input-fields-and-buttons/FilteringModeOption.vue';
  import HighlightModeOption from '@/components/input-fields-and-buttons/HighlightModeOption.vue';
import LanguagePairDropdown from '@/components/input-fields-and-buttons/LanguagePairDropdown.vue';
  const props = defineProps({  
      storeId: {type: String, required: true,},
  })

  const wordListStore = useWordListStore()
  const trExampleStore = useTranslationExampleStore(props.storeId)
  
  const isWordListModalShown = ref(false)
  function closeWordListModal() {
    isWordListModalShown.value = false
  }

  function showWordListModal() {
    isWordListModalShown.value = true
  }
  
  function wordListModalBackdrop($event: any) {
    try{
      const attributes = 
        [...$event?.originalTarget?.attributes]?.
          map(e=>({name: e.name, value: e.value})) as {name: string, value: string}[];
      if (attributes.filter(e=>e.name===`data-backdrop-for`,`wordListModal`).length > 0) {
        isWordListModalShown.value = false
      }
      $event.stopPropagation();
    } catch(e) {
      /* eslint-disable no-empty */
    }
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
    trExampleStore.jumpToPage(`FIRST`)
  }

</script>