import { type ComputedRef, type Ref, type WritableComputedRef, computed, ref } from "vue"
import { defineStore } from 'pinia'
import { type Dict } from '../../../libs/szotar_common/src/models/Dict.js';
import { DictDescription } from "../../../libs/szotar_common/src/models/DictDescription.js";
import { ColumnDefinition } from "../../../libs/szotar_common/src/models/ColumnDefinition.js";
import { type PageJumpType } from "@/frontend_models/PageJumpType.js";
import { type FilteredEntry } from "@/frontend_models/FilteredEntry.js";
import { obtainTrExampleFindResult, useTranslationExampleStore } from "./translationExample";
import { type ColumnDefinitionArrayForm } from "@/frontend_models/ColumnDefinitionArrayForm.js";
import { type SearchCondition } from "../../../libs/szotar_common/src/models/SearchCondition.js";
import { useSavedTrExampleStore } from "./savedTrExample";
import type { SavedTranslationExample } from "../../../libs/szotar_common/src/models/SavedTranslationExample.js";
import type { DictStoreType } from "@/frontend_models/DictStoreType.js";
import { backendBaseUrl } from "@/config.js";
import type { ExampleFindReq } from "../../../libs/szotar_common/src/models/ExampleFindReq.js";

export const obtainDictQueryResult = async (
  dictName: string, 
  backendSearchQuery: string, 
  customSortComparison: string
): Promise<Record<string, string>[]> => {
  const res = await (await fetch(`${backendBaseUrl}/dict`, {
    headers: {
      'Accept': `application/json`,
      'Content-Type': `application/json`,
    },
    method: `POST`, 
    body: JSON.stringify({
      name: dictName,
      searchQuery: backendSearchQuery,
      customSortComparison,
    }),
  })).json() as Record<string, string>[];
  return res;
}

export const useDictStore = (id: DictStoreType) => { 
  const store =  defineStore(`dict-${id}`, () => {
    
    const trExampleStore = useTranslationExampleStore(`dictModal`)

    const savedTrExStore = useSavedTrExampleStore()

    const dictNameOnForm = ref(``)
    
    const setDictNameOnForm = async(val: string) => {
      dictNameOnForm.value = val;
    }

    const dictNameUsedInLastQuery = ref(``)

    const dictQueriesWithMeta: Ref<Record<string,Dict>> = ref({})

    const lastDictQueryResult = computed(() => dictQueriesWithMeta.value[dictNameUsedInLastQuery.value])

    const refreshDictMetas = async () => {
      //console.log(`DEBUG getDictMetas egyszer lefut`)
      try {
        const res = await (await fetch(`${backendBaseUrl}/meta`, {
          headers: {
            'Accept': `application/json`,
            'Content-Type': `application/json`,
          },
          method: `GET`, 
        })).json() as {name: string, meta: DictDescription}[]
        for (const e of res) {
          if(!Object.keys(dictQueriesWithMeta.value).includes(e.name)) {
            dictQueriesWithMeta.value[e.name] = {main:[],meta:e.meta,}
          } else {
            dictQueriesWithMeta.value[e.name].meta = e.meta
          }
        }
        await setDictNameOnForm((Object.keys(dictQueriesWithMeta.value) ?? [])[0]) 
      } catch(error) {
        console.log(error)
      }
    }

    const frequencySearchResult: Ref<Record<number, number>> = ref({})

    const currentIdx = ref(-1)

    const currentUuid = computed(() => {
      if (
        Array.isArray(filteredEntries.value) && 
        currentIdx.value !== -1 && 
        currDict.value?.meta?.idCol 
      ){
        return filteredEntries.value[currentIdx.value]?.val[currDict.value.meta.idCol] ?? ``
      } else {
        return ``
      }
    })

    const entryInTrExampleModalFormat: ComputedRef<string[]> = computed(()=>{
      if (
        Array.isArray(filteredEntries.value) && 
        currentIdx.value !== -1 
      ){
        const entry = filteredEntries.value[currentIdx.value]
        const originalCol = currDict.value.meta.originalCol
        const res = currDictColsAsSortedArray.value.
          filter(
            e=>
              e.colName === originalCol || 
              e.colDef.isMeaningForestCol ||
              e.colDef.isUsedInTrExampleSearch
          ).
          map(
            e=>
              e.colDef.isMeaningForestCol ? 
              `<${(entry?.val[e.colName] ?? ``).split(`>`).join(``).split(`<`).join(``)}>` :
              (entry?.val[e.colName] ?? ``).split(`>`).join(``).split(`<`).join(``)
          ).
          filter(e=>e.split(`>`).join(``).split(`<`).join(``).trim() !== ``);
        return res
      } else {
        return []
      }
    })
    
    const lang1Phrases: ComputedRef<string[]> = computed(
      () => entryInTrExampleModalFormat.value.
        filter(e=> !(e.trim().startsWith(`<`) && e.trim().endsWith(`>`))).
        map(e=>e.trim()).
        filter(e=>e!==``)
    )

    const lang1PhrasesWithoutParentheses = computed(
      () => lang1Phrases.value.
        map(e => e.
          replaceAll(/\[[^\]]*\]/g,'').
          replaceAll(/\([^)]*\)/g,'').
          replaceAll(/\{[^}]*\}/g,'')
        )  
    )
    
    const lang2PhrasesRaw: ComputedRef<string[]> = computed(
      () => entryInTrExampleModalFormat.value.
        filter(e=> e.trim().startsWith(`<`) && e.trim().endsWith(`>`)).
        map(e=>e.substring(1,e.length-1))
    )     

    const lang2Phrases: ComputedRef<string[]> = computed( 
      () => lang2PhrasesRaw.value.
        map(
            e => 
              e.
                replaceAll(/\[[^\]]*\]/g,'').
                replaceAll(/\([^)]*\)/g,'').
                replaceAll(/\{[^}]*\}/g,'').
                split(`;`).join(`,`).
                split(`/`).join(`,`).
                split(`\\`).join(``).
                split(`,`)
        ).
        flat().
        map(e=>e.trim()).
        filter(e=>e!==``)
    )


    const setCurrentIdx = async (idx: number) => {
      savedTrExStore.newElemEditor = {
        isLoading: false,
        original: ``,
        translated: ``,
        isOfLowImportance: false,
        isOfHighImportance: false,
        visible: false,
      };
      savedTrExStore.existingElemEditor = {
        uuid: ``,
        original: ``,
        translated: ``,
        isOfLowImportance: false,
        isOfHighImportance: false,
        isLoading: false,
      }
      currentIdx.value = idx;
      isAllQuickAccessBtnVisible.value = false;
      await trExampleStore.resetBigFilter(lang2PhrasesRaw.value.join(`; `));
      const words = lang1PhrasesWithoutParentheses.value[0]?.split(` `).filter(e=>e.trim()!==``) ?? []
      const conditions = words.map(
        expression => ({
          expression, 
          onlyWithSpaceDotOrCommaSuffix: false,//TODO provided by config
          onlyWithSpacePrefix: false, //TODO provided by config
        } as SearchCondition)
      )
      await trExampleStore.resetSearchConditions(conditions)
      await trExampleStore.refreshExampleList(trExampleStore.exampleFindReq, false)
      trExampleStore.jumpToPage(`FIRST`);
      trExampleStore.setFilteringMode(`MARK_ONLY`);
      trExampleStore.setQuickSearchQueryPhrase(``);
      //TODO wordList.ts-bol atepiteni
    }

    

    const refreshEntries = async (backendSearchQuery: string, customSortComparison: string) => {
      try {
        const queryResult = await obtainDictQueryResult(dictNameOnForm.value,backendSearchQuery,customSortComparison);
        const previousQueryDictName = dictNameUsedInLastQuery.value;
        dictNameUsedInLastQuery.value = dictNameOnForm.value;
        dictQueriesWithMeta.value[dictNameUsedInLastQuery.value].main = [...queryResult];
        const currSourceLang = 
          dictQueriesWithMeta.value[dictNameUsedInLastQuery.value].meta.sourceLang
        const currTargetLang = 
          dictQueriesWithMeta.value[dictNameUsedInLastQuery.value].meta.targetLang
        const pairExists = 
          trExampleStore.languagePairs.filter(
            e => e.lang1===currSourceLang && e.lang2===currTargetLang
          ).length > 0
        if (
          currSourceLang.trim() !== `` && 
          currTargetLang.trim() !== `` &&
          pairExists
        ) {
          trExampleStore.setLang1(currSourceLang)
          trExampleStore.setLang2(currTargetLang)
        }
        setCurrentIdx(-1)
        //if we have changed dictionary, reset the selected m.f. column
        if(previousQueryDictName !== dictNameUsedInLastQuery.value) {
          selectedMeaningForestCol.value = meaningForestColsInPrioOrder.value[dictNameUsedInLastQuery.value]?.at(0);
        }
      } catch(error) {
        console.log(error)
      }
      
    }

    const quickSearchQueryPhrase: Ref<string> = ref(``)

    const setQuickSearchQueryPhrase = (val: string) => quickSearchQueryPhrase.value = val

    const currentPageIdx = ref(0);

    const currentPageOneIncremented = computed({
      get: ():number => currentPageIdx.value + 1,
      set: (value: number) => currentPageIdx.value = value - 1,
    });
    
    const currentPageInputField: Ref<{val:string,valid:boolean}> = ref({
      val: ''+currentPageOneIncremented.value,
      valid: true,
    });

    const currentPageInputForTwoWayBinding: WritableComputedRef<string> = computed({
      get: (): string => currentPageInputField.value.val,
      set: (value: string): void => {
        if (!Number.isNaN(parseInt(value)) && !Number.isNaN(Number(value))){
          if (parseInt(value)>0 && parseInt(value)<=totalPageCount.value) {
            currentPageOneIncremented.value = parseInt(value) 
            currentPageInputField.value.valid=true;
          } else {
            console.log('debug: invalid input value')
            currentPageInputField.value.valid=false;
          }
        } else {
          currentPageInputField.value.valid=false;
        }
        currentPageInputField.value.val = value;
      },
    })

    const jumpToPage = (pageJumpType: PageJumpType) => {
      frequencySearchResult.value = {}
      if (pageJumpType === `FIRST`) {
        currentPageInputForTwoWayBinding.value = ''+1;
      } else if (pageJumpType === `PREVIOUS`) {
        currentPageInputForTwoWayBinding.value = ''+(currentPageOneIncremented.value-1);
      } else if (pageJumpType === `NEXT`) {
        currentPageInputForTwoWayBinding.value = ''+(currentPageOneIncremented.value+1);
      } else if (pageJumpType === `LAST`) {
        currentPageInputForTwoWayBinding.value = ''+totalPageCount.value;
      }
    }
    
    const isFirstPage: Ref<boolean> = computed(() => currentPageIdx.value===0);
    
    const isLastPage: Ref<boolean> = computed(() => currentPageIdx.value===totalPageCount.value-1);

    const resultsPerPageOptions: Ref<number[]> = ref([40,80,100,160,200,500]);

    const resultsPerPage: Ref<number> = ref(80);

    const setResultsPerPage = async (num: number) => resultsPerPage.value = num;

    const sortCol = ref(``)

    const sortAscending = ref(true)

    const toggleSort = (colName: string) => {
      if (sortCol.value !== colName) {
        sortCol.value = colName;
        sortAscending.value = true;
      } else if (sortCol.value === colName && sortAscending.value === true) { 
        sortAscending.value = false;
      } else if (sortCol.value === colName && sortAscending.value === false) { 
        sortCol.value = ``;
      }
    }

    const filteredEntries = computed(() => {
      let res
      if (quickSearchQueryPhrase.value!==``) {
        res = lastDictQueryResult.value?.
          main?.
          map(
            (e,i)=>
              ({
                idx:i,
                val:e,
              })
          ).
          filter(
            e=>Object.keys(currDictColsUsedInQuickSearch.value).
              some(
                key => 
                  quickSearchQueryPhrase.value.
                  toLowerCase().
                  split(`,`).
                  map(e=>e.trim()).
                  some( 
                    phrase =>
                      (e.val[key]?.toString().toLowerCase() ?? ``).
                      includes(phrase)
                  )
              )
          );
      } else {
        res = lastDictQueryResult.value?.main?.map(
          (e,i)=>
            ({
              idx:i,
              val:e,
            })
        );
      }
      const typeSafeResult = res ?? []
      const sortedResult = 
        sortCol.value!==`` ? 
        typeSafeResult.sort(
          (a,b) => 
            (sortAscending.value ? 1 : -1) * (a.val[sortCol.value].toLowerCase() > b.val[sortCol.value].toLowerCase() ? 1 : -1)
        ): 
        typeSafeResult;
      const finalResult: FilteredEntry[] = sortedResult.map((e,i)=> ({idx:e.idx, val:e.val, sortedIdx:i,}))
      return finalResult
    })

    const pagesOfFilteredEntries = computed(()=> {
      const chunkSize = resultsPerPage.value;
      return filteredEntries.value.reduce((acc, _, i) => {
        if (i % chunkSize === 0) acc.push(filteredEntries.value.slice(i, i + chunkSize))
        return acc
      }, [] as FilteredEntry[][])
  })

    const currPageOfFilteredEntries = computed(()=>
      pagesOfFilteredEntries.value.at(currentPageIdx.value) ?? []
    );

    const totalPageCount: ComputedRef<number> = computed(()=> {
      if (filteredEntries.value===undefined || filteredEntries.value.length===0){
        //console.log('hopp')
        return 1;
      } else {
        const res = Math.ceil(filteredEntries.value.length / resultsPerPage.value)
        //console.log(filteredEntries.value.length)
        //console.log(resultsPerPage.value)
        //console.log(res)
        return res;
      }
    });

    const nonLowPrioExamplesOfCurrDict: ComputedRef<SavedTranslationExample[][]> = 
      computed( () => 
        filteredEntries.value.map(
          filteredEntry => 
            filteredEntry.val[currDict.value.meta.idCol] ?
            (savedTrExStore.examplesOfCurrDict[filteredEntry.val[currDict.value.meta.idCol]] ?? []).
            filter(e=> !e.isOfLowImportance).
            slice().sort((a,b)=>Number(b.isOfHighImportance ?? false) - Number(a.isOfHighImportance ?? false)):
            []
        )
      );

    const bulkOpMenuIsOpen = ref(false);

    const selectedIndices: Ref<Set<number>> = ref(new Set());

    //private, ne vezesd ki
    const selectAll = async () => {
      selectedIndices.value = new Set(lastDictQueryResult.value?.main.keys())
    } 

    const isAllSelected = computed(() => selectedIndices.value.size === lastDictQueryResult.value?.main.length)

    const toggleAllSelection = async () => {
      if (isAllSelected.value) {
        selectedIndices.value.clear()
      } else {
        await selectAll()
      }
    }

    const displayColsAsRawString = ref(false)
    
    const displayRowNumbers = ref(false)

    const displaySavedExamples = ref(true)

    const currDict = 
      computed(() => dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]);
    
    const currDictCols = 
      computed(() => (dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]?.meta?.cols ?? {}));

    const dictColsAsSortedArray: ComputedRef<Record<string,ColumnDefinitionArrayForm[]>> = 
    computed(
      () => 
        Object.fromEntries(
          Object.keys(dictQueriesWithMeta.value).map(
            dictName => [
              dictName, 
              Object.entries(dictQueriesWithMeta.value[dictName]?.meta?.cols ?? {}).
                map(e=> ({colName: e[0], colDef: e[1],}) ).
                sort((a,b)=>(a.colDef?.sequence ?? 99) > (b.colDef?.sequence ?? 99) ? 1 : -1)
            ]
          )
        )
    );

    const currDictColsAsSortedArray: ComputedRef<ColumnDefinitionArrayForm[]> = 
      computed(
        () => 
          dictColsAsSortedArray.value[dictNameUsedInLastQuery.value] ?? []
      );

    const currDictVisibleCols: ComputedRef<ColumnDefinitionArrayForm[]> = 
      computed(() => currDictColsAsSortedArray.value.filter(e=>e.colDef?.isVisible))
    
    const currDictColsUsedInQuickSearch: ComputedRef<Record<string, ColumnDefinition>> = computed(() => Object.fromEntries(Object.entries(currDictCols.value).filter(e=>e[1]?.isUsedInTrExampleSearch)))
    
    const toggleVisibility = async (colName: string) => {
      const colDef = (dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]?.meta?.cols ?? {})[colName]
      if (colDef!==undefined){
        colDef.isVisible = !colDef.isVisible;
        if(colDef.isVisible) {
          colDef.isUsedInTrExampleSearch=true;
        }
      }
    }
    const toggleQuickSearchEnabled = async (colName: string) => {
      const colDef = (dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]?.meta?.cols ?? {})[colName]
      if (colDef!==undefined){
        colDef.isUsedInTrExampleSearch = !colDef.isUsedInTrExampleSearch;
      }
    }

    const entryDetailsActiveTab = ref(2);
    
    const setEntryDetailsActiveTab = (val : number) => entryDetailsActiveTab.value = val;

    const isTheFirstEntryActive = computed(()=>currentIdx.value===0);
    
    const isTheLastEntryActive = computed(()=>currentIdx.value===filteredEntries.value.length - 1);

    const isAllQuickAccessBtnVisible = ref(false);

    const setIsAllQuickAccessBtnVisible =  (val: boolean) => isAllQuickAccessBtnVisible.value = val;

    const searchQuery = ref(``)

    const sortComparison = ref(``)

    const meaningForestColsInPrioOrder: ComputedRef<Record<string,string[]>> = computed(
      () => Object.fromEntries(
        Object.keys(dictQueriesWithMeta.value).map(
          dictName => [
            dictName, 
            [
              ...dictColsAsSortedArray.value[dictName].
                filter(e=>e.colDef.isDefaultMeaningForestCol && e.colDef.isMeaningForestCol),
              ...dictColsAsSortedArray.value[dictName].
                filter(e=>!e.colDef.isDefaultMeaningForestCol && e.colDef.isMeaningForestCol),
            ].map(e=>e.colName)
          ]
        )
      )
    );

    const selectedMeaningForestCol: Ref<string | undefined> = ref(undefined);

    const executeBackendSearch = async () => {
      await refreshEntries(searchQuery.value, sortComparison.value)
      selectedIndices.value.clear()
      jumpToPage(`FIRST`)
    }

    const pagesDisplayedInKnowledgeTest = ref(3);

    const runFrequencySearch = async () => {
      const currSourceLang = 
        dictQueriesWithMeta.value[dictNameUsedInLastQuery.value].meta.sourceLang
      const currTargetLang = 
        dictQueriesWithMeta.value[dictNameUsedInLastQuery.value].meta.targetLang
      frequencySearchResult.value = {}
      for (const [idx, entry] of currPageOfFilteredEntries.value.entries()) {
        await new Promise((_) => setTimeout(_, 1000));
        const originalColValue = 
          entry.val[currDict.value.meta.originalCol].
            replaceAll(/\[[^\]]*\]/g,``).
            replaceAll(/\([^)]*\)/g,``).
            replaceAll(/\{[^}]*\}/g,``).
            trim();
        
        const exampleFindReq: ExampleFindReq = {
          lang1: currSourceLang,
          lang2: currTargetLang,
          searchInSecondParamLanguage: false,
          resultLimit: 10000,
          conditions: [{
           expression: originalColValue,
           onlyWithSpaceDotOrCommaSuffix: true,
           onlyWithSpacePrefix: true,
          }]
        }
        frequencySearchResult.value[idx] = -1
        try {
          const findResult = await obtainTrExampleFindResult(exampleFindReq)
          frequencySearchResult.value[idx] = findResult?.entries?.length ?? -1
        } catch (e) {
          console.error(e)
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(async () => {
      await trExampleStore.refreshLanguagePairs()
      trExampleStore.setLang1(trExampleStore.languagePairs[0]?.lang1 ?? ``);
      trExampleStore.setLang2(trExampleStore.languagePairs[0]?.lang2 ?? ``);
      await refreshDictMetas()
    })()

    return {  
      refreshEntries,
      resultsPerPage,
      setResultsPerPage,
      quickSearchQueryPhrase,
      setQuickSearchQueryPhrase,
      filteredEntries,
      resultsPerPageOptions,
      jumpToPage,
      isFirstPage,
      isLastPage,
      pagesOfFilteredEntries,
      currPageOfFilteredEntries,
      currentPageIdx,
      currentPageInputField,
      currentPageInputForTwoWayBinding,
      currentPageOneIncremented,
      bulkOpMenuIsOpen,
      selectedIndices,
      isAllSelected,
      toggleAllSelection,
      refreshDictMetas,
      dictNameOnForm,
      dictNameUsedInLastQuery,
      dictQueriesWithMeta,
      setDictNameOnForm,
      displayColsAsRawString,
      currDictCols,
      dictColsAsSortedArray,
      currDictColsAsSortedArray,
      currDictVisibleCols,
      toggleVisibility,
      toggleQuickSearchEnabled,
      currDictColsUsedInQuickSearch,
      toggleSort,
      sortCol,
      sortAscending,
      displayRowNumbers,
      displaySavedExamples,
      entryDetailsActiveTab,
      setEntryDetailsActiveTab,
      currentIdx,
      setCurrentIdx,
      isTheFirstEntryActive,
      isTheLastEntryActive,
      isAllQuickAccessBtnVisible,
      setIsAllQuickAccessBtnVisible,
      entryInTrExampleModalFormat,
      currDict,
      currentUuid,
      lang1Phrases,
      lang2Phrases,
      nonLowPrioExamplesOfCurrDict,
      pagesDisplayedInKnowledgeTest,
      searchQuery,
      sortComparison,
      executeBackendSearch,
      meaningForestColsInPrioOrder,
      selectedMeaningForestCol,
      runFrequencySearch,
      frequencySearchResult,
    }

  })();
  return store;
};