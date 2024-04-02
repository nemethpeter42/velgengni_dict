import { type ComputedRef, type Ref, type WritableComputedRef, computed, ref } from "vue"
import { defineStore } from 'pinia'
import { type ExampleFindReq } from '../../../libs/szotar_common/src/models/ExampleFindReq';
import { type ExampleArrayWithBackendLimit } from "../../../libs/szotar_common/src/models/ExampleArrayWithBackendLimit.js";
import { type Example } from "../../../libs/szotar_common/src/models/Example.js";
import { type GeneratedLink } from "../../../libs/szotar_common/src/models/GeneratedLink.js";
import { type PageJumpType } from "@/frontend_models/PageJumpType.js";
import { type FilteredEntry } from "@/frontend_models/FilteredEntry.js";
import { type SearchCondition } from "../../../libs/szotar_common/src/models/SearchCondition.js";
import { type HighlightDefinition } from "@/frontend_models/HighlightDefinition.js";
import { type LanguagePair } from "@/frontend_models/LanguagePair.js";

export const useTranslationExampleStore = (id: string) => { 
  const store =  defineStore(`translationExample-${id}`, () => {

    type FilteringModeOpts = `FILTER` | `MARK_ONLY` | `INVERSE_FILTER`

    const filteringMode: Ref<FilteringModeOpts> = ref(`MARK_ONLY`)

    const setFilteringMode =  (val: FilteringModeOpts) => {
      filteringMode.value = val
      jumpToPage(`FIRST`)
    }

    const isLoading = ref(false)

    const isQueryLangHighlightedSeparately = ref(true)

    const isQueryLangHighlightedJoined = ref(false)

    const isResultLangHighlited = ref(true)

    const languagePairs: Ref<LanguagePair[]> = ref([])

    const refreshLanguagePairs = async () => {
      try {
        const res = await (await fetch(`http://localhost:3035/tr_example_languages`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: `GET`, 
        })).json() as LanguagePair[];
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
      resultLimit: 10000,
    } as ExampleFindReq) 
      
    const quickSearchQueryPhrase: Ref<string> = ref(``)

    const setQuickSearchQueryPhrase = (val: string) => quickSearchQueryPhrase.value = val

    const bigFilterInputFieldVal = ref(``)

    const bigFilterLastQueryVal: Ref<string[]> = ref([])

    const executeBigFilterQuery = () => {
      bigFilterLastQueryVal.value = 
        bigFilterInputFieldVal.value.
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
      jumpToPage(`FIRST`);
    }

    const resetBigFilter = async (val: string | undefined) => {
      bigFilterInputFieldVal.value = 
        (val ?? ``).
          replaceAll(/\[[^\]]*\]/g,'').
          replaceAll(/\([^)]*\)/g,'').
          replaceAll(/\{[^}]*\}/g,'').
          split(`*`).join(``)
      executeBigFilterQuery()
    }

    const currentPage = ref(0);

    const exampleList: Ref<Example[]> = ref([]);

    const generatedLinks: Ref<GeneratedLink[]> = ref([])

    const isGeneratedLinksLoading = ref(false)

    const refreshGeneratedLinks = async (lang: string, phrase: string) => {
      generatedLinks.value = []
      //quick bugfix for "setCurrentIdx(-1)" case
      if (phrase.trim() ===``) {return;}
      isGeneratedLinksLoading.value = true
      try {
        const url = `http://localhost:3035/generated_links/generate_links_for_entry?lang=${encodeURIComponent(lang)}&phrase=${encodeURIComponent(phrase)}`
        const res = await (await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: `GET`, 
        })).json() as GeneratedLink[];
        generatedLinks.value = res
        isGeneratedLinksLoading.value = false;
      } catch(error) {
        isGeneratedLinksLoading.value = false;
        console.log(error);
      }
    }

    const lastTrExampleQueryErrored = ref(false)

    const refreshExampleList = async (exampleFindReqParam: ExampleFindReq, isInverseSearch?: boolean) => {
      lastTrExampleQueryErrored.value = false;
      isLoading.value = true
      selectedIndices.value.clear();
      exampleList.value = []
      const exampleFindReq: ExampleFindReq = JSON.parse(JSON.stringify(exampleFindReqParam))
      exampleFindReq.searchInSecondParamLanguage = isInverseSearch
      refreshGeneratedLinks(exampleFindReq.lang1, exampleFindReq.conditions.map(cnd => cnd.expression.trim()).join(` `))
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
        jumpToPage(`FIRST`)
        isLoading.value = false;
      } catch(error) {
        isLoading.value = false;
        console.log(error);
        lastTrExampleQueryErrored.value = true;
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

    const resultsPerPageOptions: Ref<number[]> = ref([25,50,75,100,200,500]);

    const resultsPerPage: Ref<number> = ref(500);

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
      `background-color: rgba(255,   0, 255, 0.40);`, // rozsa-magenta
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
        res = exampleList.value?.map(
          (e,i)=>
            ({
              idx:i,
              val:{'example': `${e.original.split(`\t`).join(` `)}\t${e.translated.split(`\t`).join(` `)}`,},
            })
        );
        if (
            quickSearchQueryPhrase.value.trim() !== `` ||
            [`FILTER`, `INVERSE_FILTER`].includes(filteringMode.value) && 
            bigFilterLastQueryVal.value.length > 0
          ) {
            res = res.filter(e=>
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
                  //map(e => [e,e.replaceAll(/a$/gi,`á`).replaceAll(/e$/gi,`é`)]).flat().
                  some( 
                      phrase =>
                          (e.val?.example?.toLowerCase() ?? ``).
                          includes(phrase)
                  ):
                  true
              );
        } 
        const typeSafeResult = res ?? []
        const sortedResult = 
            sortCol.value!==`` ? 
            typeSafeResult.sort(
              (a,b) => 
                (sortAscending.value ? 1 : -1) * (a.val.example?.toLowerCase() > b.val.example?.toLowerCase() ? 1 : -1)
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

    

    const resetSearchConditions = async(conditions: SearchCondition[]) => {
      for (const condition of conditions) {
        if (condition.expression){
          condition.expression = condition.expression.split(`|`).join(``)
        }
      }
      exampleFindReq.value.conditions = conditions;
    }


    return {
      isLoading,
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
      setQuickSearchQueryPhrase,
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
      bigFilterInputFieldVal,
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
      filteredEntries,
      generatedLinks,
      isGeneratedLinksLoading,
      lastTrExampleQueryErrored,
  }

})()
return store
};