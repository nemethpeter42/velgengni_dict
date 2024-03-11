<template>
    <div class="floating-action-button-container absolute z-[100] ">
      <button 
        title="Save modifications"
        @click="savedTrExampleStore.saveDb()"
        class="
        save-modifications-btn
        absolute top-1 left-5 w-9 h-9 rounded-full drop-shadow-lg
        flex justify-center items-center text-2xl 
        hover:drop-shadow-2xl "
        :class="
          savedTrExampleStore.isDirty ? 
          `text-white bg-red-700 hover:bg-red-800` : 
          `text-white bg-blue-700 hover:bg-blue-800`"
        ><ArrowUpOnSquareStackIcon class="h-6 w-6" /></button>
    <div
      class="
        absolute top-1 left-16 w-16 h-9 rounded-full drop-shadow-lg 
        inline-flex
      "
    >
      <button 
        title="Scroll to top"
        class="
          scroll-to-top-btn
          inline-flex justify-center items-center text-2xl rounded-l-3xl p-0.5 pl-2
          text-white bg-blue-700
          hover:drop-shadow-2xl hover:bg-blue-800"
        @click="scrollToTop()"
      ><ArrowUpIcon class="h-6 w-6" /></button>
      <button 
        title="Scroll to bottom"
        class="
          scroll-to-bottom-btn
          inline-flex justify-center items-center text-2xl rounded-r-3xl p-0.5 pr-2
          text-white bg-blue-700
          hover:drop-shadow-2xl hover:bg-blue-800"
        @click="scrollToBottom()"
      ><ArrowDownIcon class="h-6 w-6" /></button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSavedTrExampleStore } from '@/stores/savedTrExample';
  import { ArrowUpOnSquareStackIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/24/solid'
 

  const scrollToTop = () => {
    document.querySelectorAll(`body #app .main-content`)[0].scrollTo(0,0)
  }

  const scrollToBottom = () => {
    const mainContent = document.querySelectorAll(`body #app .main-content`)[0]
    const bottomY = mainContent.scrollHeight;
    mainContent.scrollTo(0,bottomY)
  }
  const savedTrExampleStore = useSavedTrExampleStore()
</script>