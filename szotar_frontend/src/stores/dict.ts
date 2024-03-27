import { ComputedRef, Ref, WritableComputedRef, computed, ref } from "vue"
import { defineStore } from 'pinia'
import { Dict } from '../../../libs/szotar_common/src/models/Dict.js';
import { DictDescription } from "../../../libs/szotar_common/src/models/DictDescription.js";
import { ColumnDefinition } from "../../../libs/szotar_common/src/models/ColumnDefinition.js";
import { PageJumpType } from "@/frontend_models/PageJumpType.js";
import { FilteredEntry } from "@/frontend_models/FilteredEntry.js";
import { useTranslationExampleStore } from "./translationExample";
import { TrExampleStoreType } from "@/frontend_models/TrExampleStoreTypes";
import { ColumnDefinitionArrayForm } from "@/frontend_models/ColumnDefinitionArrayForm.js";
import { SearchCondition } from "../../../libs/szotar_common/src/models/SearchCondition.js";
import { useSavedTrExampleStore } from "./savedTrExample";

export const useDictStore = defineStore('dict', () => {
  //const entries: Ref<Record<string, string>[]> = ref([]);
  /*
  const count = ref(0)
  const name = ref('Eduardo')
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  */
  
  const trExampleStore = useTranslationExampleStore(TrExampleStoreType.DICT_MODAL)

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
      const res = await (await fetch(`http://localhost:3035/meta`, {
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

  const currentIdx = ref(-1)

  const currentUuid = computed(() => {
    if (
      Array.isArray(filteredEntries.value) && 
      currentIdx.value !== -1 && 
      currDict.value?.meta?.idCol 
    ){
      return filteredEntries.value[currentIdx.value].val[currDict.value.meta.idCol]
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
            `<${entry?.val[e.colName].split(`>`).join(``).split(`<`).join(``)}>` :
            entry?.val[e.colName].split(`>`).join(``).split(`<`).join(``)
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
      isLowPriority: false,
      visible: false,
    };
    savedTrExStore.existingElemEditor = {
      uuid: ``,
      original: ``,
      translated: ``,
      isLowPriority: false,
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
      const res = await (await fetch(`http://localhost:3035/dict`, {
        headers: {
          'Accept': `application/json`,
          'Content-Type': `application/json`,
        },
        method: `POST`, 
        body: JSON.stringify({
          name: dictNameOnForm.value,
          searchQuery: backendSearchQuery,
          customSortComparison,
        }),
      })).json()
      dictNameUsedInLastQuery.value = dictNameOnForm.value
      dictQueriesWithMeta.value[dictNameUsedInLastQuery.value].main = [...(res as Record<string, string>[])]
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

    } catch(error) {
      console.log(error)
    }
  }

  const quickSearchQueryPhrase: Ref<string> = ref(``)

  const setQuickSearchQueryPhrase = (val: string) => quickSearchQueryPhrase.value = val

  const currentPage = ref(0);

  const currentPageOneIncremented = computed({
    get: ():number => currentPage.value + 1,
    set: (value: number) => currentPage.value = value - 1,
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
  
  const isFirstPage: Ref<boolean> = computed(() => currentPage.value===0);
  
  const isLastPage: Ref<boolean> = computed(() => currentPage.value===totalPageCount.value-1);

  const resultsPerPageOptions: Ref<number[]> = ref([25,50,100,200,500]);

  const resultsPerPage: Ref<number> = ref(50);

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

  const onePageOfFilteredEntries = computed(()=>
    filteredEntries.value.slice(
      currentPage.value*resultsPerPage.value,
      (currentPage.value+1)*resultsPerPage.value
    )
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
  })

  const bulkOpMenuIsOpen = ref(false)

  const selectedIndices: Ref<Set<number>> = ref(new Set())

  //private, ne vezesd ki
  const selectAll = async () => {
    selectedIndices.value = new Set(lastDictQueryResult.value?.main.keys())
  } 

  const isAllSelected = computed(() => selectedIndices.value.size === lastDictQueryResult.value?.main.length ?? false)

  const toggleAllSelection = async () => {
    if (isAllSelected.value) {
      selectedIndices.value.clear()
    } else {
      await selectAll()
    }
  }

  const displayColsAsRawString = ref(false)
  
  const displayRowNumbers = ref(false)

  const currDict = 
    computed(() => dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]);
  
  const currDictCols = 
    computed(() => (dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]?.meta?.cols ?? {}))

  const currDictColsAsSortedArray: ComputedRef<ColumnDefinitionArrayForm[]> = 
    computed(
      () => 
        Object.entries(currDictCols.value).
          map(e=> ({colName: e[0], colDef: e[1],}) ).
          sort((a,b)=>(a.colDef?.sequence ?? 99) > (b.colDef?.sequence ?? 99) ? 1 : -1)
    );

  const currDictVisibleCols: ComputedRef<ColumnDefinitionArrayForm[]> = 
    computed(() => currDictColsAsSortedArray.value.filter(e=>e.colDef?.isVisible))
  
  const currDictColsUsedInQuickSearch: ComputedRef<Record<string, ColumnDefinition>> = computed(() => Object.fromEntries(Object.entries(currDictCols.value).filter(e=>e[1]?.isUsedInTrExampleSearch)))
  
  const toggleVisibility = async (colName: string) => {
    const colDef = (dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]?.meta?.cols ?? {})[colName]//Object.entries(dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]?.meta?.cols ?? {}).filter(e => e[0]===colName).map(e => e[1])[0]
    //console.log(colDef)
    if (colDef!==undefined){
      colDef.isVisible = !colDef.isVisible;
      if(colDef.isVisible) {
        colDef.isUsedInTrExampleSearch=true;
      }
    }
  }
  const toggleQuickSearchEnabled = async (colName: string) => {
    const colDef = (dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]?.meta?.cols ?? {})[colName]//Object.entries(dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]?.meta?.cols ?? {}).filter(e => e[0]===colName).map(e => e[1])[0]
    //console.log(colDef)
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
    onePageOfFilteredEntries,
    currentPage,
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
    currDictColsAsSortedArray,
    currDictVisibleCols,
    toggleVisibility,
    toggleQuickSearchEnabled,
    currDictColsUsedInQuickSearch,
    toggleSort,
    sortCol,
    sortAscending,
    displayRowNumbers,
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
  }
})