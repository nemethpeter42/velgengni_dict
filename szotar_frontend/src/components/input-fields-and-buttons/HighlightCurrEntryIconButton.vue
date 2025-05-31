<template>
  <button 
    type="button" 
    
    class="
      px-2 py-2 ml-2 mr-1
      font-medium rounded-lg text-sm 
      text-yellow-200 bg-blue-700 hover:bg-blue-800 
      focus:ring-4 focus:ring-blue-300 focus:outline-none 
      dark:bg-blue-600 dark:hover:bg-blue-700 
      dark:focus:ring-blue-800
    ">
    <PaintBrushIcon class="h-4 w-4 text-gray-100" />
  </button>
</template>
<script lang="ts" setup>
  import { PaintBrushIcon } from '@heroicons/vue/24/solid'
</script>