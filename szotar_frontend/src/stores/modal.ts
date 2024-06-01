import { defineStore } from "pinia"
import { type Ref, ref } from "vue"

export const useModalStore = defineStore(`modal`, () => {
  const openModals: Ref<Set<(
    'DICT_CONFIG'|
    'DICT_ENTRY_DETAILS'|
    'WORD_LIST'|
    'SAVED_QUERIES'|
    'SAVED_QUERIES_KNOWLEDGE'
    )>> = ref(new Set());
    
  return {
    openModals,
  }
})