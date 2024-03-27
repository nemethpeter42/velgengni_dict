<template>
  <button 
    type="button" 
    
    class="
      px-2 py-2 ml-1 mr-1
      font-medium rounded-lg text-sm 
      text-gray-900 bg-yellow-200 
      border border-gray-200 
      hover:bg-yellow-300
      focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
      dark:bg-cyan-800 dark:text-gray-200 dark:border-0
      dark:border-gray-600 
      dark:hover:text-white dark:hover:bg-cyan-700
      dark:focus:ring-gray-700 
    ">
    <PencilSquareIcon class="h-6 w-6" />
  </button>
</template>
<script lang="ts" setup>
  import { PencilSquareIcon, } from '@heroicons/vue/24/solid'
</script>