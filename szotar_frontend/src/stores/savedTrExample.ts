import { defineStore } from "pinia"
import { ComputedRef, Ref, WritableComputedRef, computed, ref } from "vue"
import { SavedTranslationExample } from "../../../libs/szotar_common/src/models/SavedTranslationExample.js";
import { move } from "../../../libs/szotar_common/src/helpers/move.js";
import { PageJumpType } from "@/frontend_models/PageJumpType.js";
import { FilteredEntry } from "@/frontend_models/FilteredEntry.js";
import { useDictStore } from "./dict";

export const useSavedTrExampleStore = defineStore(`savedTrExample`, () => {
  
  const savedTrExamples: Ref<Record<string,SavedTranslationExample[]>> = ref({})

  const isLoading = ref(false);

  const quickSearchQueryPhrase: Ref<string> = ref(``);

  const setQuickSearchQueryPhrase = (val: string) => quickSearchQueryPhrase.value = val;
  
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
  
  const dictStore = useDictStore()

  const examplesOfCurrEntry: ComputedRef<SavedTranslationExample[]> = computed(
    () => 
      dictStore.currentUuid !== `` && savedTrExamples.value[dictStore.dictNameUsedInLastQuery]?
      savedTrExamples.value[dictStore.dictNameUsedInLastQuery].filter(e=>e.dictEntryUuid === dictStore.currentUuid):
      []
  );

  const filteredEntries = computed(() => {
    let res;
   
    // eslint-disable-next-line prefer-const
    res = examplesOfCurrEntry.value?.map(
      (e,i)=>
        ({
          idx:i,
          val:{
            example: `${e.original.split(`\t`).join(` `)}\t${e.translated.split(`\t`).join(` `)}`, 
            uuid: e.uuid, 
            dictEntryUuid: e.dictEntryUuid,
          },
        })
    );

    if (quickSearchQueryPhrase.value.trim() !== ``) {
      res =  res.filter(
        e=> 
         finalPhrasesUsedInFiltering.value.
          //map(e => [e,e.replaceAll(/a$/gi,`á`).replaceAll(/e$/gi,`é`)]).flat().
          some( 
              phrase =>
                  (e.val?.example?.toLowerCase() ?? ``).
                  includes(phrase)
          )
      );
    }
    
    const typeSafeResult = res ?? [];
    const sortedResult = 
      sortCol.value!==`` ? 
      typeSafeResult.sort(
        (a,b) => 
          (sortAscending.value ? 1 : -1) * (a.val.example?.toLowerCase() > b.val.example?.toLowerCase() ? 1 : -1)
      ): 
      typeSafeResult;
    //TODO globally sortedIdx -> idxAfterFilterAndSort idx -> idxBeforeFilter  
    const finalResult: FilteredEntry[] = sortedResult.map((e,i)=> ({idx:e.idx, val:e.val, sortedIdx:i,}));
    return finalResult;
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
      selectedIndices.value = new Set(examplesOfCurrEntry.value?.keys())
  } 

  const isAllSelected = computed(() => selectedIndices.value.size === examplesOfCurrEntry.value?.length ?? false)

  const toggleAllSelection = async () => {
      if (isAllSelected.value) {
          selectedIndices.value.clear()
      } else {
          await selectAll()
      }
  }

    

  const refreshTrExamples = async () => {
    isLoading.value = true;
    try {
      const res = await fetch(`http://localhost:3035/saved_examples/get_db`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: `GET`, 
      })
      if (res.ok){
        const parsedRes = await res.json() as Record<string,SavedTranslationExample[]>;
        savedTrExamples.value = parsedRes;
        isLoading.value = false;
      } else {
        const text = await res.text()
        throw Error(text)
      }
        
    } catch(error) {
        console.error(error);
        isLoading.value = false;
    }
  };

  const create = async (dictName: string, entry: SavedTranslationExample) => {
    newElemEditor.value.isLoading = true
    try {
      const res = await fetch(`http://localhost:3035/saved_examples/create`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: `POST`,
        body: JSON.stringify({
          dictName,
          entry,
        })
      });
      if (res.ok) {
        const parsedRes = await res.json() as {uuid: string};
        entry.uuid = parsedRes.uuid;
        savedTrExamples.value[dictName].push(entry);
        newElemEditor.value.visible = false;
        newElemEditor.value.isLoading = false;
        isDirty.value = true;
      } else {
        const text = await res.text();
        throw Error(text);
      }
    } catch(error) {
        newElemEditor.value.isLoading = false
        console.error(error);
    }
  };

  const update = async (dictName: string, entry: SavedTranslationExample) => {
    existingElemEditor.value.isLoading = true
    try {
      const idx = savedTrExamples.value[dictName]?.findIndex(e=>e.uuid && e.uuid === entry.uuid) ?? -1;
      if (idx===-1) {
        throw Error(`Cannot find element in store`);
      }
      entry.dictEntryUuid = savedTrExamples.value[dictName][idx].dictEntryUuid;
      const res = await fetch(`http://localhost:3035/saved_examples/update`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: `PUT`,
        body: JSON.stringify({
          dictName,
          entry,
        })
      });
      if (res.ok) {
        
        savedTrExamples.value[dictName][idx] = entry;
        existingElemEditor.value.uuid = ``;
        existingElemEditor.value.isLoading = false;
        isDirty.value = true;
      } else {
        const text = await res.text();
        throw Error(text);
      }
    } catch(error) {
        existingElemEditor.value.isLoading = false;
        console.error(error);
    }
  };

  const execMove = async (dictName: string, direction: `UP`| `DOWN`, uuid: string) => {
    try {
      const res = await fetch(`http://localhost:3035/saved_examples/move`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: `POST`,
        body: JSON.stringify({
          dictName,
          direction,
          uuid,
        })
      });
      if (res.ok) {
        savedTrExamples.value[dictName] = move(savedTrExamples.value[dictName], direction, uuid)
        isDirty.value = true;
      } else {
        const text = await res.text();
        throw Error(text);
      }
    } catch(error) {
        console.error(error);
    }
  };

  const remove = async (dictName: string, uuid: string) => {
    try {
      const res = await fetch(`http://localhost:3035/saved_examples/delete`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: `DELETE`,
        body: JSON.stringify({
          dictName,
          uuid,
        })
      });
      if (res.ok) {
        savedTrExamples.value[dictName] = savedTrExamples.value[dictName].filter(e=>e.uuid !== uuid)
        isDirty.value = true;
      } else {
        const text = await res.text();
        throw Error(text);
      }
    } catch(error) {
        console.error(error);
    }
  };


  const saveDb = async () => {
    try {
      const res = await fetch(`http://localhost:3035/saved_examples/save_db`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: `POST`,
        body: JSON.stringify({
        })
      });
      if (res.ok) {
        isDirty.value = false;
      } else {
        const text = await res.text();
        throw Error(text);
      }
    } catch(error) {
        console.error(error);
    }
  };

  refreshTrExamples()

  const isDirty = ref(false)

  //turned off, as for now
  const phrasesUsedInHighlight = ref([]);

  
  const newElemEditor: Ref<{
    visible: boolean;
    original: string;
    translated: string;
    isLowPriority?: boolean;
    isLoading: boolean;
  }> = ref({
    visible: false,
    original: ``,
    translated: ``,
    isLowPriority: false,
    isLoading: false, // TODO implement
  })

  /* TODO
  tablazatban akkor lathato a sor alatti felteteles <tr>-ben fuggologes megjelenitesben, ha toltve van a uuid
  v-slot kell a datatable-be emiatt
  sikeres mentes eseten v. lapozaskor (setCurrentIdx?) torolni kell a uuid-t
  */
  const existingElemEditor: Ref<{
    uuid: string;
    original: string;
    translated: string;      
    isLowPriority?: boolean;
    isLoading: boolean;
  }> = ref({
    uuid: ``,
    original: ``,
    translated: ``,
    isLowPriority: false,
    isLoading: false, // TODO implement
  })

  return {
    newElemEditor,
    existingElemEditor,
    savedTrExamples,
    isDirty,
    refreshTrExamples,
    create,
    update,
    execMove,
    remove,
    saveDb,
    isLoading,
    quickSearchQueryPhrase,
    setQuickSearchQueryPhrase,
    currentPage,
    currentPageOneIncremented,
    currentPageInputField,
    currentPageInputForTwoWayBinding,
    filteredEntries,
    onePageOfFilteredEntries,
    totalPageCount,
    resultsPerPage,
    resultsPerPageOptions,
    jumpToPage,
    setResultsPerPage,
    isFirstPage,
    isLastPage,
    isAllSelected,
    sortAscending,
    sortCol,
    toggleSort,
    selectedIndices,
    phrasesUsedInHighlight,
    toggleAllSelection,
    examplesOfCurrEntry,
  }
})