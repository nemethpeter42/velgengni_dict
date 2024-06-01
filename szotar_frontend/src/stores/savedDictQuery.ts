import type { Noti } from "@/frontend_models/Noti"
import { defineStore } from "pinia"
import { computed, type Ref, ref } from "vue"

import { type SavedDictQuery } from "../../../libs/szotar_common/src/models/SavedDictQuery";
import { useDictStore } from "./dict";
import { useNotiStore } from "./noti";

export const useSavedDictQueryStore = defineStore(`savedDictQuery`, () => {

  const notiStore = useNotiStore();
  const dictStore = useDictStore();
  

 
  const entries: Ref<SavedDictQuery[]> = ref([
    {
      uuid:`abcdef-1234-0001`,
      title:`test query hibas 1`,
      dictName:`ervenytelen`,
      searchQuery: `e.original.trim().toLowerCase().includes(\`cat\`)`,
      sortComparison: `-1*a.original.localeCompare(b.original, \`es\`)`,
    },
    {
      uuid:`abcdef-1234-0002`,
      title:`test query jo 1`,
      dictName:`spanyol_szoszedet`,
      searchQuery: `e.original.trim().toLowerCase().includes(\`cat\`)`,
      sortComparison: `-1*a.original.localeCompare(b.original, \`es\`)`,
    },
  ])
  
  const newElemEditor: Ref<{
    title: string;
  }> = ref({
    title: ``,
  })

  const newElemIsValid = computed(() => newElemEditor.value.title !== ``)

  const isLoading = ref(false);
  
  const getAllEntries = async () => {
    isLoading.value = true;
    try {
      const res = await fetch(`http://localhost:3035/saved_queries/get_all`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: `GET`, 
      })
      if (res.ok){
        const parsedRes = await res.json() as SavedDictQuery[];
        entries.value = parsedRes;
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
  getAllEntries();

  const create = async () => {
    const entry: SavedDictQuery = {
      uuid: ``,
      title: newElemEditor.value.title,
      searchQuery: dictStore.searchQuery,
      dictName: dictStore.dictNameOnForm,
      sortComparison: dictStore.sortComparison,
    };
    isLoading.value = true
    try {
      const res = await fetch(`http://localhost:3035/saved_queries/create`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: `POST`,
        body: JSON.stringify({
          entry,
        })
      });
      if (res.ok) {
        const parsedRes = await res.json() as {uuid: string};
        entry.uuid = parsedRes.uuid;
        entries.value.push(entry);
        newElemEditor.value.title = ``;
      } else {
        const text = await res.text();
        throw Error(text);
      }
    } catch(error) {
        isLoading.value = false
        console.error(error);
    }
  };
  

  const querySelected = (entry: SavedDictQuery) => {
    const validDictionaries = Object.keys(dictStore.dictQueriesWithMeta)
    if(!validDictionaries.includes(entry.dictName)) {
      notiStore.notifications.push({
        type:`error`,
        msg:`Dictonary not found: "${entry.dictName}"`,
      })
    } else {
      dictStore.searchQuery = entry.searchQuery;
      dictStore.dictNameOnForm = entry.dictName;
      dictStore.sortComparison = entry.sortComparison;
      dictStore.executeBackendSearch()
    }
  }


  return {
    entries,
    newElemEditor,
    newElemIsValid,
    querySelected,
    create,
    getAllEntries,
  }
})
