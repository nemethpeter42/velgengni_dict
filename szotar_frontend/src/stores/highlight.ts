
import { backendBaseUrl } from "@/config";
import { defineStore } from "pinia"
import { type Ref, ref } from "vue"

export const useFavoritesStore = defineStore(`favorites`, () => {
  
  const db: Ref<Record<string, Set<string>>> = ref({})

  const isDirty = ref(false);
  
  const isInitialized = ref(false);

  const isLoading = ref(false);
  
  const getAllEntries = async () => {
    isLoading.value = true;
    try {
      const res = await fetch(`${backendBaseUrl}/saved_highlights/get_all`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: `GET`, 
      })
      if (res.ok){
        const parsedRes = await res.json() as Record<string, string[]>;
        db.value = 
          Object.fromEntries(
            Object.keys(parsedRes).map(key=>[key,new Set(parsedRes[key])])
          );
        isLoading.value = false;
        isInitialized.value = true;
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


  const add = (dictName: string, uuid: string) => {
    if (isInitialized.value && uuid) {
      if (!db.value[dictName]) {
        db.value[dictName] = new Set<string>();
      }
      db.value[dictName].add(uuid);
      isDirty.value = true;
    }
  }

  const remove = (dictName: string, uuid: string) => {
    if (isInitialized.value && uuid && db.value[dictName]) {
      db.value[dictName].delete(uuid);
      isDirty.value = true;
    }
  }

  const toggle = (dictName: string, uuid: string) => {
    if (isInitialized.value && uuid) {
      if (isHighlighted(dictName,uuid)) {
        remove(dictName,uuid);
      } else {
        add(dictName, uuid);
      }
    }
  }

  const isHighlighted = 
    (dictName: string, uuid: string): boolean => 
      uuid!==`` && db.value[dictName] && db.value[dictName].has(uuid);

  
    const saveDb = async () => {
      if (isInitialized.value) {
        isLoading.value = true;
        const dbWithArrays = 
          Object.fromEntries(
            Object.keys(db.value).
              map(key=>[key,[...db.value[key]]])
          )
        try {
          const res = await fetch(`${backendBaseUrl}/saved_highlights/save_db`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            method: `POST`,
            body: JSON.stringify({
              db: dbWithArrays,
            })
          });
          if (res.ok) {
            isLoading.value = false;
            isDirty.value = false;
          } else {
            const text = await res.text();
            throw Error(text);
          }
        } catch(error) {
            isLoading.value = false
            console.error(error);
        }
      }
    };

  return {
    add,
    remove,
    isHighlighted,
    toggle,
    isDirty,
    saveDb,
    db,
  }
})