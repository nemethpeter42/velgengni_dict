import { ComputedRef, Ref, WritableComputedRef, computed, ref } from "vue"
import { defineStore } from 'pinia'
import { Dict } from '../../../libs/szotar_common/src/models/Dict.js';
import { DictDescription } from "../../../libs/szotar_common/src/models/DictDescription.js";
import { ColumnDefinition } from "../../../libs/szotar_common/src/models/ColumnDefinition.js";
import { PageJumpType } from "@/frontend_models/PageJumpType.js";
import { FilteredEntry } from "@/frontend_models/FilteredEntry.js";

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
      dictQueriesWithMeta.value[dictNameUsedInLastQuery.value].main = res as Record<string, string>[]
    } catch(error) {
      console.log(error)
    }
  }

  const quickSearchQueryPhrase: Ref<string> = ref(``)

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
    const sortedResult: FilteredEntry[] = 
      sortCol.value!==`` ? 
      typeSafeResult.sort((a,b) => (sortAscending.value ? 1 : -1) * (a.val[sortCol.value].toLowerCase() > b.val[sortCol.value].toLowerCase() ? 1 : -1)): 
      typeSafeResult;
    return sortedResult
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
  
  const currDictCols = computed(() => (dictQueriesWithMeta.value[dictNameUsedInLastQuery.value]?.meta?.cols ?? {}))

  const currDictVisibleCols: ComputedRef<Record<string, ColumnDefinition>> = computed(() => Object.fromEntries(Object.entries(currDictCols.value).filter(e=>e[1]?.isVisible)))
  
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

  return {  
    refreshEntries,
    resultsPerPage,
    setResultsPerPage,
    quickSearchQueryPhrase,
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
    currDictVisibleCols,
    toggleVisibility,
    toggleQuickSearchEnabled,
    currDictColsUsedInQuickSearch,
    toggleSort,
    sortCol,
    sortAscending,
    displayRowNumbers,
  }
})