<template>
  <button 
    type="button" 
    class="
      px-3 py-2 mx-2
      font-medium rounded-lg text-sm 
      text-white bg-blue-700 hover:bg-blue-800 
      focus:ring-4 focus:ring-blue-300 focus:outline-none 
      dark:bg-blue-600 dark:hover:bg-blue-700 
      dark:focus:ring-blue-800
    ">
    <WrenchScrewdriverIcon class="h-4 w-4 text-gray-100" />
  </button>
</template>
<script lang="ts" setup>
  import { WrenchScrewdriverIcon } from '@heroicons/vue/24/solid'
</script>