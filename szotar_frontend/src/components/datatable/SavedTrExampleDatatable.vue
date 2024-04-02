<template>
  <div class="relative">
    <DtSpinner
      v-if="savedTrExStore.isLoading" 
      test-id="tr-example-datatable"
    />
  
    <div class="shadow-md sm:rounded-lg" id="tr-example-table-top-anchor">
      <div class="
        flex flex-wrap items-center justify-between 
        border-t-2 border-x-2
        border-cyan-200 
        dark:border-indigo-900 
        sm:rounded-t-lg">
        <div class="my-1.5">
          
          <DictBulkActions />
          
        </div>
        <div class="flex my-1.5">
          <QuickSearch 
            :modelValue="savedTrExStore.quickSearchQueryPhrase"
            @update:modelValue="val => savedTrExStore.setQuickSearchQueryPhrase(val)"
            @input="savedTrExStore.jumpToPage(`FIRST`);"
          />
        </div>
      </div>
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        
        <HeaderOfColumns 
          :columnDefinitions="[{colName:`example`, colDef:{isVisible: true,isTrExamplePairCol:true,}}]"
          :isAllSelected="savedTrExStore.isAllSelected"
          :sortCol="savedTrExStore.sortCol"
          :sortAscending="savedTrExStore.sortAscending"
          @toggleSort="(colName: string) => savedTrExStore.toggleSort(colName)"
          @toggleAllSelection="savedTrExStore.toggleAllSelection()"
        />
        
        <DatatableBody
          :onePageOfEntries="savedTrExStore.onePageOfFilteredEntries"
          :columnDefinitions="[{colName:`example`, colDef:{isVisible: true,isTrExamplePairCol:true,}}]"
          :displayColsAsRawString="false"
          :selectedIndices="savedTrExStore.selectedIndices"
          :highlightedTexts="savedTrExStore.phrasesUsedInHighlight"
          @toggleRowSelection="(idx: number,$event: Event) => toggleRowSelection(idx,$event)"
        >
          <template #rowLevelButtons="{idx,sortedIdx,}">
            <!--- 
              TODO move-up move-down delete
              <AddExistingExampleButton 
              v-if="props.addExistingButtonVisible"
              @click= "$emit(`addExistingExample`, savedTrExStore.exampleList[idx])"
            /> --->
            <MoveUpButton 
              @click="moveExample(sortedIdx, `UP`)" 
            />
            <MoveDownButton 
              @click="moveExample(sortedIdx, `DOWN`)" 
            />
            <EditSavedExampleButton 
              @click="setEditorTo(idx)" 
            />
            <RemoveSavedExampleButton 
              @click="removeExample(sortedIdx)" 
            />
            <span 
              class="ml-3 w-10"
              :class="{
                [`text-red-500 dark:text-red-400 italic`]:savedTrExStore.examplesOfCurrEntry[idx].isLowPriority, 
                
              }"
              >
                <span
                  :class="{
                    [`text-green-500 dark:text-green-400`]:savedTrExStore.examplesOfCurrEntry[idx].isGrammaticalExample, 
                  }"
                  >
                  #{{ idx + 1 }}
                </span>
            </span>
          </template>
          <template #detailRow="{sortedIdx,preferredColspan,}">
            <tr
              v-if="
                savedTrExStore.existingElemEditor.uuid && 
                savedTrExStore.existingElemEditor.uuid === savedTrExStore.filteredEntries[sortedIdx].val?.uuid"
              >
              <td :colspan="preferredColspan">
                <ExistingSavedExampleEditor />
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
          :options="savedTrExStore.resultsPerPageOptions" 
          :currently-selected="savedTrExStore.resultsPerPage"
          @input="(val: number) => {savedTrExStore.setResultsPerPage(val);savedTrExStore.jumpToPage(`FIRST`);scrollToTableTop();}"
          />
        <DtPagination 
          @jumpToPage="(pageJumpType: PageJumpType) => {savedTrExStore.jumpToPage(pageJumpType); scrollToTableTop();}" 
          :isFirstPage="savedTrExStore.isFirstPage"
          :isLastPage="savedTrExStore.isLastPage" 
          v-model="savedTrExStore.currentPageInputForTwoWayBinding"
          :isGivenInputAValidPage="savedTrExStore.currentPageInputField.valid"  
          >
        </DtPagination>
      </nav>
    </div>
  </div>
</template>
<script lang="ts" setup>
import DtPagination from '@/components/datatable/DtPagination.vue'
import { onMounted } from 'vue';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type PageJumpType } from '@/frontend_models/PageJumpType';
import DictBulkActions from '@/components/datatable/DictBulkActions.vue';
import QuickSearch from '@/components/datatable/QuickSearch.vue';
import PageSizeInput from './PageSizeInput.vue';
import HeaderOfColumns from './HeaderOfColumns.vue';
import DatatableBody from './DatatableBody.vue';
import { useTranslationExampleStore } from '@/stores/translationExample';
import { useWordListStore } from '@/stores/wordList';
import TrExampleStats from './TrExampleStats.vue';
import { TrExampleStoreType } from '@/frontend_models/TrExampleStoreTypes';
import DtSpinner from './DtSpinner.vue';
import HighlightModeOption from '../input-fields-and-buttons/HighlightModeOption.vue';
import { useSavedTrExampleStore } from '@/stores/savedTrExample';
import MoveDownButton from '../input-fields-and-buttons/MoveDownButton.vue';
import MoveUpButton from '../input-fields-and-buttons/MoveUpButton.vue';
import RemoveSavedExampleButton from '../input-fields-and-buttons/RemoveSavedExampleButton.vue';
import { useDictStore } from '@/stores/dict';
import EditSavedExampleButton from '../input-fields-and-buttons/EditSavedExampleButton.vue';
import ExistingSavedExampleEditor from '../input-fields-and-buttons/ExistingSavedExampleEditor.vue';
import { type SavedTranslationExample } from '../../../../libs/szotar_common/src/models/SavedTranslationExample';


const savedTrExStore = useSavedTrExampleStore();
const dictStore = useDictStore();

const setEditorTo = (idxBeforeFilter: number) => {
  const entry = savedTrExStore.examplesOfCurrEntry?.at(idxBeforeFilter)
  if (entry){
    savedTrExStore.existingElemEditor.uuid = entry.uuid;
    savedTrExStore.existingElemEditor.original = entry.original;
    savedTrExStore.existingElemEditor.translated = entry.translated;
    savedTrExStore.existingElemEditor.isLowPriority = entry.isLowPriority;
    savedTrExStore.existingElemEditor.isGrammaticalExample = entry.isGrammaticalExample;
  }
}

const moveExample = async (sortedIdx: number, direction: `UP`|`DOWN`) => {
    const dictName = dictStore.dictNameUsedInLastQuery;
    const uuid = savedTrExStore.filteredEntries?.at(sortedIdx)?.val.uuid ?? ``
    if (uuid) {
      await savedTrExStore.execMove(
        dictName,
        direction,
        uuid
      );
    } else {
      console.error(`Error while retrieving uuid`)
    }
    
  }

const removeExample = async (sortedIdx: number) => {
    const dictName = dictStore.dictNameUsedInLastQuery;
    const uuid = savedTrExStore.filteredEntries?.at(sortedIdx)?.val.uuid ?? ``
    if (uuid) {
      await savedTrExStore.remove(
        dictName,
        uuid
      );
    } else {
      console.error(`Error while retrieving uuid`)
    }
    
  }


const scrollToTableTop = (): void => {
    document.getElementById('tr-example-table-top-anchor')?.scrollIntoView();
};

//debug celokra (pl. event) ideiglenesen behuzhato
//const log = (param: any) => console.log(param)

const toggleRowSelection = (index: number, $event: Event) => {
  ($event?.target as HTMLInputElement)?.checked ? savedTrExStore.selectedIndices.add(index): savedTrExStore.selectedIndices.delete(index)
} 

// initialize components based on data attribute selectors
onMounted(async () => {
  `TODO kell?`
})


</script>