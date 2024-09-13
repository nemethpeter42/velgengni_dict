import type { ModalType } from "@/frontend_models/ModalType";
import { defineStore } from "pinia"
import { type Ref, ref } from "vue"

export const useModalStore = defineStore(`modal`, () => {
  const openModals: Ref<Set<ModalType>> = ref(new Set());
    
  return {
    openModals,
  }
})