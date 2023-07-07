import { ComputedRef, Ref, WritableComputedRef, computed, ref } from "vue"
import { defineStore } from 'pinia'
import { PageJumpType } from "@/frontend_models/PageJumpType.js";
import { FilteredEntry } from "@/frontend_models/FilteredEntry.js";

export const useWordListStore = defineStore('wordList', () => {
    
    const wordList : Ref<string[][]>= ref([]);

    const languagePairs: Ref<{lang1: string, lang2: string,}[]> = ref([])

    const currLang1: Ref<string> = ref(``)

    const currLang2: Ref<string> = ref(``)

    const currentIdx: Ref<number> = ref(-1)

    const setCurrentIdx = (idx: number) => currentIdx.value = idx;

    const refreshWordList = async () => {
        //console.log(`DEBUG getDictMetas egyszer lefut`)
        try {
            const res = await (await fetch(`http://localhost:3035/list`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: `GET`, 
            })).json() as string[][];
            wordList.value = res;
            
        } catch(error) {
            console.log(error);
        }
    };


    const refreshLanguagePairs = async () => {
        //console.log(`DEBUG getDictMetas egyszer lefut`)
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

    const resultsPerPageOptions: Ref<number[]> = ref([15,30,50,100,]);

    const resultsPerPage: Ref<number> = ref(15);

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

    const filteredEntries = computed(() => {
        let res
        if (quickSearchQueryPhrase.value!==``) {
            res = wordList.value?.
                map((e,i)=>({idx:i,val:{'word': e.join(`\t`),},})).
                filter(
                    e=> e.val?.word?.toLowerCase().
                        includes(quickSearchQueryPhrase.value.toLowerCase())
                );
        } else {
            res = wordList.value?.map((e,i)=>({idx:i,val:{'word': e.join(`\t`),},}));
        }
        const typeSafeResult = res ?? []
        const sortedResult: FilteredEntry[] = 
            sortCol.value!==`` ? 
            typeSafeResult.sort((a,b) => (sortAscending.value ? 1 : -1) * (a.val.word.toLowerCase() > b.val.word.toLowerCase() ? 1 : -1)): 
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



    return {
        wordList,
        refreshWordList,
        refreshLanguagePairs,
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
        currentIdx,
        setCurrentIdx,
        languagePairs,
        currLang1,
        currLang2,
    }
});