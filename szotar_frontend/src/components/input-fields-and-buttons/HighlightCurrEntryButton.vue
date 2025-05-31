<template>
  <button 
    id="saveModificationsLargeButton"
    class="
      m-1 mr-2 mb-1 px-5 py-2.5 font-medium rounded-full text-sm text-center
      border border-gray-400 
      focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
      dark:border-gray-600 
      dark:focus:ring-gray-700 
      "
      :class="{
        [`
          text-gray-50 
          bg-orange-600 
          hover:bg-orange-700 
          dark:bg-orange-700 
          dark:hover:bg-orange-600 
        `]: props.isHighlighted,
        [`
          text-gray-900 
          dark:text-gray-50 
          bg-white 
          hover:bg-gray-200 
          dark:bg-gray-800 
          dark:hover:bg-gray-700
        `]: !props.isHighlighted,
      }"
    >
    Kiemelés
  </button>  
</template>
<script lang="ts" setup>
  const props = defineProps<{  
    isHighlighted: boolean,
  }>();
</script>