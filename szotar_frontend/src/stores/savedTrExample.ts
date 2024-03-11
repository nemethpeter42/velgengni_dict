import { defineStore } from "pinia"
import { Ref, ref } from "vue"
import { SavedTranslationExample } from "../../../libs/szotar_common/src/models/SavedTranslationExample.js";

export const useSavedTrExampleStore = defineStore(`savedTrExample`, () => {
  
  const savedTrExamples: Ref<Record<string,SavedTranslationExample[]>> = ref({})

  const refreshTrExamples = async () => {
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
      } else {
        const text = await res.text()
        throw Error(text)
      }
        
    } catch(error) {
        console.error(error);
    }
  };

  const create = async (dictName: string, entry: SavedTranslationExample) => {
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

  return {
    savedTrExamples,
    isDirty,
    refreshTrExamples,
    create,
    saveDb,
  }
})