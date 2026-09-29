<template>
  <div 
    class=" 
      flex items-center justify-center 
      font-medium rounded-lg 
      text-gray-500 
      border-[3px] border-gray-500 
      focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
      dark:border-0
      dark:border-gray-600 
      dark:text-gray-200
      dark:hover:text-white 
      dark:focus:ring-gray-700"
    :class="{
      [`
        bg-sky-200 hover:bg-sky-300 
        dark:bg-teal-700 dark:hover:bg-teal-600 
      `]: !primary && !active,
      [`
        bg-purple-200 hover:bg-purple-300 
        dark:bg-blue-700 dark:hover:bg-blue-600 
      `]: primary,
      [`
        bg-yellow-200 hover:bg-yellow-300 
        dark:bg-purple-600 dark:hover:bg-purple-700 
      `]: active,
      [`
        bg-red-200 hover:bg-red-300 
        dark:bg-red-600 dark:hover:bg-red-700 
      `]: danger,
    }"
    
    :data-generic-main-btn-for="props.testId"
    >
    <slot></slot>
  </div>
</template>
<script setup lang="ts">

 const props = defineProps<{  
    testId: string,
    primary?: true,
    active?: boolean,
    danger?: boolean,
 }>();
</script>