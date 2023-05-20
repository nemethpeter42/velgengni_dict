import { ComputedRef, Ref, WritableComputedRef, computed, ref } from "vue"
import { defineStore } from 'pinia'
import { Dict } from '../../../libs/szotar_common/src/models/Dict.js';
import { DictDescription } from "../../../libs/szotar_common/src/models/DictDescription.js";

export const useDictStore = defineStore('dict', () => {
    const entries: Ref<Record<string, string>[]> = ref([]);
    /*
    const count = ref(0)
    const name = ref('Eduardo')
    const doubleCount = computed(() => count.value * 2)
    function increment() {
      count.value++
    }
    */

    const backendSearchQuery = ref(``)

    const selectedDictNameOnSearchForm = ref(``)

    const dictNameUsedInLastQuery = ref(``)


    const dictQueriesWithMeta: Ref<Record<string,Dict>> = ref({})

    const refreshDictMetas = async () => {
        console.log(`DEBUG getDictMetas egyszer lefut`)
        try {
            const res = await (await fetch(`http://localhost:3035/meta`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
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
        } catch(error) {
            console.log(error)
        }
    }

    const refreshEntries = async () => {
        try {
            const res = await (await fetch(`http://localhost:3035/dict`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: `POST`, 
                body: JSON.stringify({
                    name: `nemet_szoszedet`,
                    code: backendSearchQuery.value,
                }),
            })).json()
            entries.value = res as Record<string, string>[]
        } catch(error) {
            console.log(error)
        }
    }

    const quickSearchQueryPhrase: Ref<string> = ref(``)

    const currentPage = ref(0);
    const currentPageOneIncremented = computed({
        get: ():number => currentPage.value + 1,
        set: (value: number) => currentPage.value = value - 1,
    })
    
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

    const jumpToNextPage = () => currentPageInputForTwoWayBinding.value = ''+(currentPageOneIncremented.value+1);
    
    const jumpToPreviousPage = () => currentPageInputForTwoWayBinding.value = ''+(currentPageOneIncremented.value-1);

    const jumpToFirstPage = () => currentPageInputForTwoWayBinding.value = ''+1;
    
    const jumpToLastPage = () => currentPageInputForTwoWayBinding.value = ''+totalPageCount.value;
    
    const isFirstPage: Ref<boolean> = computed(() => currentPage.value===0);
    
    const isLastPage: Ref<boolean> = computed(() => currentPage.value===totalPageCount.value-1);

    const resultsPerPageOptions: Ref<number[]> = ref([25,50,100,200,500]);

    const resultsPerPage: Ref<number> = ref(50);

    const setResultsPerPage = async (num: number) => resultsPerPage.value = num;

    const filteredEntries = computed(() => {
        return quickSearchQueryPhrase.value!==`` ? entries.value.filter(e=>Object.keys(e).some(key => (e[key]?.toString().toLowerCase() ?? ``).includes(quickSearchQueryPhrase.value.toLowerCase()))): entries.value
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
        selectedIndices.value = new Set(entries.value.keys())
    } 

    const isAllSelected = computed(() => selectedIndices.value.size === entries.value.length)

    const toggleAllSelection = async () => {
        if (isAllSelected.value) {
            selectedIndices.value.clear()
        } else {
            await selectAll()
        }
    }

    return {  
        entries,
        refreshEntries,
        resultsPerPage,
        setResultsPerPage,
        quickSearchQueryPhrase,
        filteredEntries,
        resultsPerPageOptions,
        jumpToNextPage,
        jumpToFirstPage,
        jumpToPreviousPage,
        jumpToLastPage,
        isFirstPage,
        isLastPage,
        onePageOfFilteredEntries,
        currentPage,
        currentPageInputField,
        currentPageInputForTwoWayBinding,
        currentPageOneIncremented,
        backendSearchQuery,
        bulkOpMenuIsOpen,
        selectedIndices,
        isAllSelected,
        toggleAllSelection,
        refreshDictMetas,
        selectedDictNameOnSearchForm,
        dictNameUsedInLastQuery,
    }
  })