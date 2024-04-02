<template>
  <div
    class="
        flex max-w-[90rem] m-auto flex-col 
        lg:flex-row
      "
    >
    <div 
      class="
        border-dashed
        border-gray-200 dark:border-gray-800 
        lg:grow-0 lg:pr-1 lg:border-r-4
      "
      >
      <BigFilterInput
        v-model="trExampleStore.bigFilterInputFieldVal"
        @goButtonClicked="trExampleStore.executeBigFilterQuery()"
      />
      
      <div class="flex flex-wrap items-center">
       
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
            Array.isArray(dictStore.filteredEntries) && dictStore.currentIdx !== -1 ? 
            [dictStore.filteredEntries[dictStore.currentIdx].val[`original`]] : 
            []"  
          :defaultNumOfDisplayedItems="10" 
          @quickAccessSelected="(selection: QuickAccessSelectionResult) => handleQuickAccessSelected(selection)" 
          :isAllDisplayed="dictStore.isAllQuickAccessBtnVisible"
          @displayAll="dictStore.setIsAllQuickAccessBtnVisible(true)"
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
  <div class="flex flex-wrap max-w-6xl m-auto">

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

</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import TrExampleResultLimit from '@/components/input-fields-and-buttons/TrExampleResultLimit.vue';
  import ExampleSearchButton from '@/components/input-fields-and-buttons/ExampleSearchButton.vue';
  import { useTranslationExampleStore } from '@/stores/translationExample';
  import SearchConditionEditor from '@/components/input-fields-and-buttons/SearchConditionEditor.vue';
  import GeneratedQuickAccessBtnList from '@/components/input-fields-and-buttons/GeneratedQuickAccessBtnList.vue';
  import BigFilterInput from '@/components/input-fields-and-buttons/BigFilterInput.vue';
  import { type QuickAccessSelectionResult } from '@/frontend_models/QuickAccessSelectionResult';
  import { type SearchCondition } from '../../../../../libs/szotar_common/src/models/SearchCondition';
  import ExampleSearchAltLangButton from '@/components/input-fields-and-buttons/ExampleSearchAltLangButton.vue';
  import FilteringModeOption from '@/components/input-fields-and-buttons/FilteringModeOption.vue';
  import HighlightModeOption from '@/components/input-fields-and-buttons/HighlightModeOption.vue';
  import LanguagePairDropdown from '@/components/input-fields-and-buttons/LanguagePairDropdown.vue';
  import { useDictStore } from '@/stores/dict';
  
  const props = defineProps({  
      storeId: {type: String, required: true,},
  })

  const dictStore = useDictStore()
  const trExampleStore = useTranslationExampleStore(props.storeId)
  
 
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