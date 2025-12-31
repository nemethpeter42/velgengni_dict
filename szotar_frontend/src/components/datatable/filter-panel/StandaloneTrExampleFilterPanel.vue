<template>
  
  <div
    class="
      relative flex max-w-[90rem] m-auto flex-col 
      lg:flex-row
    ">
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
          text="a" 
          id="extraPrioImportantBtn"
          v-if="prioButtonsEnabled"
          @click=" 
            async () => 
              {
                wordListStore.prioImportantWords.push(wordListStore.currentIdx)
                if(!wordListStore.isTheLastEntryActive){
                  wordListStore.setCurrentIdx(wordListStore.currentIdx+1);
                }
              }"
          />

        <WordListPrevNextButton 
          text="." 
          id="extraPrioAverageBtn"
          v-if="prioButtonsEnabled"
          @click=" 
            async () => 
              {
                wordListStore.prioAverageWords.push(wordListStore.currentIdx)
                if(!wordListStore.isTheLastEntryActive){
                  wordListStore.setCurrentIdx(wordListStore.currentIdx+1);
                }
              }"
          />

        <WordListPrevNextButton 
          text="n" 
          id="extraPrioRareBtn"
          v-if="prioButtonsEnabled"
          @click=" 
            async () => 
              {
                wordListStore.prioRareWords.push(wordListStore.currentIdx)
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
    <div class="m-1 flex items-center">
      <!-- TODO separate data-test id-->
      <QuickSearch 
          :icon-hidden="true"
          v-model="trExampleStore.blacklistQueryPhrase"
          @input="trExampleStore.jumpToPage(`FIRST`);"
          label="Feketelista"
          />
      </div>
  </div>

</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import DtSpinner from "../DtSpinner.vue"
  import {useWordListStore,} from '@/stores/wordList'
  import TrExampleResultLimit from '@/components/input-fields-and-buttons/TrExampleResultLimit.vue';
  import ExampleSearchButton from '@/components/input-fields-and-buttons/ExampleSearchButton.vue';
  import { useTranslationExampleStore } from '@/stores/translationExample';
  import SearchConditionEditor from '@/components/input-fields-and-buttons/SearchConditionEditor.vue';
  import GeneratedQuickAccessBtnList from '@/components/input-fields-and-buttons/GeneratedQuickAccessBtnList.vue';
  import BigFilterInput from '@/components/input-fields-and-buttons/BigFilterInput.vue';
  import { type QuickAccessSelectionResult } from '@/frontend_models/QuickAccessSelectionResult';
  import { type SearchCondition } from '../../../../../libs/szotar_common/src/models/SearchCondition';
  import ExampleSearchAltLangButton from '@/components/input-fields-and-buttons/ExampleSearchAltLangButton.vue';
  import WordListPrevNextButton from '@/components/input-fields-and-buttons/WordListPrevNextButton.vue';
  import FilteringModeOption from '@/components/input-fields-and-buttons/FilteringModeOption.vue';
  import HighlightModeOption from '@/components/input-fields-and-buttons/HighlightModeOption.vue';
  import LanguagePairDropdown from '@/components/input-fields-and-buttons/LanguagePairDropdown.vue';
  import { useModalStore } from '@/stores/modal';
  import type { TrExampleStoreType } from '@/frontend_models/TrExampleStoreTypes';
  import QuickSearch from '@/components/datatable/QuickSearch.vue';

  const prioButtonsEnabled = ref(false)
  const props = defineProps<{  
      storeId: TrExampleStoreType,
  }>()

  const wordListStore = useWordListStore()
  const trExampleStore = useTranslationExampleStore(props.storeId)
  const modalStore = useModalStore();
  
  function showWordListModal() {
    modalStore.openModals.add(`WORD_LIST`)
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