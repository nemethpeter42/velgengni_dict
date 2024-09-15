<template>
  <div class="floating-action-buttons-on-example-modal absolute z-[100]">
    <button 
      title="Close modal"
      @click="modalStore.openModals.delete(`DICT_ENTRY_DETAILS`)"
      class="
      floating-close-modal-btn
      text-white bg-orange-500 
      dark:bg-orange-600 
      absolute top-[0.25rem] left-1 w-9 h-9 rounded-full drop-shadow-lg
      flex justify-center items-center text-2xl 
      hover:drop-shadow-2xl hover:bg-orange-600
      dark:hover:bg-orange-500"
      ><XMarkIcon class="h-6 w-6" /></button>

    <button 
      title="Next"
      @click="$emit(`nextBtnClick`)"
      class="
      floating-next-btn
      text-white bg-blue-700
      absolute top-[3rem] left-1 w-9 h-14 rounded-full drop-shadow-lg
      flex justify-center items-center text-2xl 
      hover:drop-shadow-2xl 
      hover:bg-blue-800"
      ><ChevronRightIcon class="h-6 w-6" /></button>

    <button 
      title="Mode button"
      @click="modeBtnClick()"
      class="
      floating-next-btn
      text-white bg-blue-700
      absolute top-[7rem] left-1 w-9 h-9 rounded-full drop-shadow-lg
      flex justify-center items-center text-2xl 
      hover:drop-shadow-2xl 
      hover:bg-blue-800"
      ><ArrowPathRoundedSquareIcon class="h-6 w-6" /></button>

    <div
      class="
        absolute top-[9.75rem] left-1 w-9 h-16 rounded-full drop-shadow-lg 
        flex flex-col
      "
    >
      <button 
        title="Scroll to top"
        class="
          scroll-to-top-btn
          inline-flex justify-center items-center text-2xl rounded-t-3xl p-0.5 pb-1 pt-1
          text-white bg-blue-700
          hover:drop-shadow-2xl hover:bg-blue-800"
        @click="$emit(`scrollToTop`)"
      ><ArrowUpIcon class="h-6 w-6" /></button>
      <button 
        title="Scroll to bottom"
        class="
          scroll-to-bottom-btn
          inline-flex justify-center items-center text-2xl rounded-b-3xl p-0.5 pt-1 pb-1
          text-white bg-blue-700
          hover:drop-shadow-2xl hover:bg-blue-800"
        @click="$emit(`scrollToBottom`)"
      ><ArrowDownIcon class="h-6 w-6" /></button>
    </div>
    
    <button 
      title="Save modifications"
      @click="savedTrExampleStore.saveDb()"
      class="
      save-modifications-btn
      absolute top-[14.25rem] left-1 w-9 h-9 rounded-full drop-shadow-lg
      flex justify-center items-center text-2xl 
      hover:drop-shadow-2xl "
      :class="
        savedTrExampleStore.isDirty ? 
        `text-white bg-red-700 hover:bg-red-800` : 
        `text-white bg-blue-700 hover:bg-blue-800`"
      ><ArrowUpOnSquareStackIcon class="h-6 w-6" /></button>
  </div>
</template>

<script setup lang="ts">
  import { useModalStore } from '@/stores/modal';
  import { useSavedTrExampleStore } from '@/stores/savedTrExample';
  import { useTranslationExampleStore } from '@/stores/translationExample';
  import { ArrowUpOnSquareStackIcon, ArrowUpIcon, ArrowDownIcon, XMarkIcon, ChevronRightIcon, ArrowPathRoundedSquareIcon } from '@heroicons/vue/24/solid'
  
  defineEmits(['nextBtnClick','scrollToTop','scrollToBottom'])

  const savedTrExampleStore = useSavedTrExampleStore();
  
  const trExampleStore = useTranslationExampleStore(`dictModal`);
  const modalStore = useModalStore();

  const modeBtnClick = async () => {
    const conditions = trExampleStore.exampleFindReq.conditions;
    const conditionsClone = JSON.parse(JSON.stringify(conditions));
    for (const condition of conditionsClone) {
      if(conditions.every(c => c.onlyWithSpacePrefix && !c.onlyWithSpaceDotOrCommaSuffix)){
        condition.onlyWithSpaceDotOrCommaSuffix = true;
      } else if (conditions.every(c => c.onlyWithSpacePrefix && c.onlyWithSpaceDotOrCommaSuffix)) {
        condition.onlyWithSpacePrefix = false;
        condition.onlyWithSpaceDotOrCommaSuffix = false;
      } else {
        condition.onlyWithSpacePrefix = true;
        condition.onlyWithSpaceDotOrCommaSuffix = false;
      }
    }
    trExampleStore.exampleFindReq.conditions = conditionsClone;
    await trExampleStore.refreshExampleList(trExampleStore.exampleFindReq, false);
  }
</script>