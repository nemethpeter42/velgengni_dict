<template>
  <button 
    type="button" 
    class="
      px-1.5 py-1.5
      font-medium rounded-lg text-sm 
      text-white bg-red-600 hover:bg-red-800 
      focus:ring-4 focus:ring-red-300 focus:outline-none 
      dark:bg-red-800 dark:hover:bg-red-700 
      dark:focus:ring-red-800
    ">
    <TrashIcon class="h-6 w-6 text-gray-100" />
  </button>
</template>
<script setup lang="ts">
  import { TrashIcon } from '@heroicons/vue/24/solid'
</script>