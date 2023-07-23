import { ComputedRef, Ref, WritableComputedRef, computed, ref } from "vue"
import { defineStore } from 'pinia'
import { ExampleFindReq } from '../../../libs/szotar_common/src/models/ExampleFindReq.js';
import { ExampleArrayWithBackendLimit } from "../../../libs/szotar_common/src/models/ExampleArrayWithBackendLimit.js";
import { Example } from "../../../libs/szotar_common/src/models/Example.js";
import { PageJumpType } from "@/frontend_models/PageJumpType.js";
import { FilteredEntry } from "@/frontend_models/FilteredEntry.js";
import { SearchCondition } from "../../../libs/szotar_common/src/models/SearchCondition.js";
import { HighlightDefinition } from "@/frontend_models/HighlightDefinition.js";

export const useTranslationExampleStore = defineStore('translationExample', () => {

  type FilteringModeOpts = `FILTER` | `MARK_ONLY` | `INVERSE_FILTER`

  const filteringMode: Ref<FilteringModeOpts> = ref(`MARK_ONLY`)

  const setFilteringMode =  (val: FilteringModeOpts) => {
    filteringMode.value = val
  }

  const isQueryLangHighlightedSeparately = ref(true)

  const isQueryLangHighlightedJoined = ref(false)

  const isResultLangHighlited = ref(true)

  const languagePairs: Ref<{lang1: string, lang2: string,}[]> = ref([])

  const refreshLanguagePairs = async () => {
    try {
      const res = await (await fetch(`http://localhost:3035/tr_example_languages`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: `GET`, 
      })).json() as {lang1: string, lang2: string,}[];
      languagePairs.value = res;
        
    } catch(error) {
        console.log(error);
    }
  };



  const setResultLimitForQuery = async (val: number) => {
    exampleFindReq.value.resultLimit = val
  }

  const exampleFindReq: Ref<ExampleFindReq> = ref({
    conditions: [],
    lang1: ``,
    lang2: ``,
    resultLimit: 3000,
  } as ExampleFindReq) 
    
  const quickSearchQueryPhrase: Ref<string> = ref(``)

  const bigFilterCurrVal = ref(``)

  const bigFilterLastQueryVal: Ref<string[]> = ref([])

  //TODO ez gyakorlatilag egy setter a bigFilterLastQueryVal-hoz, ezert azt majd at kene irni WritableComputedRef(?)-re
  const executeBigFilterQuery = () => {
    bigFilterLastQueryVal.value = 
      bigFilterCurrVal.value.
        replaceAll(/\[[^\]]*\]/g,'').
        replaceAll(/\([^)]*\)/g,'').
        replaceAll(/\{[^}]*\}/g,'').
        split(`;`).join(`,`).
        split(`/`).join(`,`).
        split(`\\`).join(``).
        split(`,`).
        map(e=>e.trim()).
        filter(e=>e!==``).
        map(e=>e.split(`_`).join(` `))
  }

  const resetBigFilter = async (val: string | undefined) => {
    bigFilterCurrVal.value = 
      (val ?? ``).
        replaceAll(/\[[^\]]*\]/g,'').
        replaceAll(/\([^)]*\)/g,'').
        replaceAll(/\{[^}]*\}/g,'')
    executeBigFilterQuery()
  }

  const currentPage = ref(0);

  const exampleList: Ref<Example[]> = ref([]);

  const refreshExampleList = async (exampleFindReqParam: ExampleFindReq, isInverseSearch?: boolean) => {
    exampleList.value = []
    const exampleFindReq: ExampleFindReq = JSON.parse(JSON.stringify(exampleFindReqParam))
    exampleFindReq.searchInSecondParamLanguage = isInverseSearch
    try {
      const res = await (await fetch(`http://localhost:3035/find`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: `POST`, 
        body: JSON.stringify(exampleFindReq),
      })).json() as ExampleArrayWithBackendLimit;
      exampleList.value = res.entries;
        
    } catch(error) {
      console.log(error);
    }
  };
  

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

  const resultsPerPage: Ref<number> = ref(100);

  const setResultsPerPage = async (num: number) => resultsPerPage.value = num;

  const sortCol = ref(``)

  const sortAscending = ref(true)

  const toggleSort = (colName: string) => {
      if (sortCol.value !== colName) {
          sortCol.value = colName
          sortAscending.value = true
      } else if (sortCol.value === colName && sortAscending.value === true) { 
          sortAscending.value = false
      } else if (sortCol.value === colName && sortAscending.value === false) { 
          sortCol.value = ``
      }
  }

  
  const HIGHLIGHT_STYLES = [
    `background-color: rgba(255, 255,   0, 0.35);`, // sarga
    
    `background-color: rgba(0,   204, 153, 0.50);`, // turkizeszold
    `background-color: rgba(255,   0, 255, 0.50);`, // rozsa-magenta
    `background-color: rgba(128,   0, 255, 0.45);`, // lila
    `background-color: rgba(0,     0, 255, 0.50);`, // sotetkek
    `background-color: rgba(204, 153,   0, 0.50);`, // vilagosbarna
    `background-color: rgba(0,   128, 255, 0.55);`, // kozepes kek
    `background-color: rgba(255, 102,   0, 0.50);`, // narancs
    `background-color: rgba(255,   0,   0, 0.45);`, // piros
    `background-color: rgba(0,   201, 255, 0.55);`, // vilagoskek
    `background-color: rgba(0,   128,   0, 0.65);`, // fenyozold
  ]


  const phrasesUsedInHighlight: Ref<HighlightDefinition[]> = computed(() => {
    // eslint-disable-next-line prefer-const
    let res: string[] = [
      ...(
        isQueryLangHighlightedSeparately.value ? 
        exampleFindReq.value.conditions.map(e=>e.expression) : 
        []
      ),
      ...(
        isQueryLangHighlightedJoined.value ? 
        [exampleFindReq.value.conditions.map(e=>e.expression).join(` `)]: 
        []
      ),
      ...(
        isResultLangHighlited.value ? 
        quickSearchQueryPhrase.value.split(`,`):
        []
      ),
      ...(
        isResultLangHighlited.value ? 
        bigFilterLastQueryVal.value:
        []
      ),
    ];
    res = res.
      map(e=>e.split(`_`).join(` `)).
      map(e=>e.trim()).
      filter(e=>e!==``)
    return [
      ...new Set(res)
    ].map((e,i) => ({
      val:e,
      style: HIGHLIGHT_STYLES[i % HIGHLIGHT_STYLES.length],
    }))
  })

  const finalPhrasesUsedInFiltering = computed(()=> {
    return quickSearchQueryPhrase.value.
      split(`,`).
      map(e=>e.trim()).
      filter(e=>e!==``).
      // concat(...(filteringMode.value===`FILTER` ? bigFilterLastQueryVal.value: [])).
      map(e=>e.toLowerCase()).
      map(e=>e.split(`_`).join(` `)).
      map(e => [e,e.replaceAll(/a$/gi,`á`).replaceAll(/e$/gi,`é`)]).flat()
  })

  const filteredEntries = computed(() => {
      let res
      if (
          quickSearchQueryPhrase.value.trim() !== `` ||
          [`FILTER`, `INVERSE_FILTER`].includes(filteringMode.value) && 
          bigFilterLastQueryVal.value.length > 0
        ) {
          res = exampleList.value?.
            map(
              (e,i)=>
                ({
                  idx:i,
                  val:{'example': `${e.original.split(`\t`).join(` `)}\t${e.translated.split(`\t`).join(` `)}`,},
                })
            ).
            filter(e=>
              [`FILTER`, `INVERSE_FILTER`].includes(filteringMode.value) ?
              (filteringMode.value===`INVERSE_FILTER`) !==
              !!bigFilterLastQueryVal.value.
                map(e => [e,e.replaceAll(/a$/gi,`á`).replaceAll(/e$/gi,`é`)]).flat().
                some( 
                phrase =>
                    (e.val?.example?.toLowerCase() ?? ``).
                    includes(phrase)
              ):
              true  
            ).
            filter(
              e=> 
                !([`FILTER`, `INVERSE_FILTER`].includes(filteringMode.value) && quickSearchQueryPhrase.value.trim() === ``) ?
                finalPhrasesUsedInFiltering.value.
                map(e => [e,e.replaceAll(/a$/gi,`á`).replaceAll(/e$/gi,`é`)]).flat().
                some( 
                    phrase =>
                        (e.val?.example?.toLowerCase() ?? ``).
                        includes(phrase)
                ):
                true
            );
      } else {
          res = exampleList.value?.map(
            (e,i)=>
              ({
                idx:i,
                val:{'example': `${e.original.split(`\t`).join(` `)}\t${e.translated.split(`\t`).join(` `)}`,},
              })
          );
      }
      const typeSafeResult = res ?? []
      const sortedResult: FilteredEntry[] = 
          sortCol.value!==`` ? 
          typeSafeResult.sort((a,b) => (sortAscending.value ? 1 : -1) * (a.val.example?.toLowerCase() > b.val.example?.toLowerCase() ? 1 : -1)): 
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
      selectedIndices.value = new Set(exampleList.value?.keys())
  } 

  const isAllSelected = computed(() => selectedIndices.value.size === exampleList.value?.length ?? false)

  const toggleAllSelection = async () => {
      if (isAllSelected.value) {
          selectedIndices.value.clear()
      } else {
          await selectAll()
      }
  }

  const setLang1 = async (val: string) => {
    exampleFindReq.value.lang1 = val
  }

  const setLang2 = async (val: string) => {
    exampleFindReq.value.lang2 = val
  }

  refreshLanguagePairs().then(function () {
    setLang1(languagePairs.value[0]?.lang1 ?? ``)
    setLang2(languagePairs.value[0]?.lang2 ?? ``)
  })

  const resetSearchConditions = async(conditions: SearchCondition[]) => {
    exampleFindReq.value.conditions = conditions;
  }


  return {
    exampleList,
    refreshExampleList,
    jumpToPage,
    isFirstPage,
    isLastPage,
    currentPageInputForTwoWayBinding,
    currentPageInputField,
    currentPageOneIncremented,
    resultsPerPageOptions,
    resultsPerPage,
    setResultsPerPage,
    totalPageCount,
    onePageOfFilteredEntries,
    toggleSort,
    sortAscending,
    sortCol,
    quickSearchQueryPhrase,
    bulkOpMenuIsOpen,
    selectedIndices,
    isAllSelected,
    toggleAllSelection,
    setResultLimitForQuery,
    exampleFindReq,
    setLang1,
    setLang2,
    refreshLanguagePairs,
    languagePairs,
    resetSearchConditions,
    bigFilterCurrVal,
    bigFilterLastQueryVal,
    resetBigFilter,
    finalPhrasesUsedInFiltering,
    executeBigFilterQuery,
    filteringMode,
    setFilteringMode,
    phrasesUsedInHighlight,
    isQueryLangHighlightedSeparately,
    isQueryLangHighlightedJoined,
    isResultLangHighlited,
}

});