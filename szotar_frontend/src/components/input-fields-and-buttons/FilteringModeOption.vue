<template>
  <div 
    @click="$emit('click')"
    class="
      flex items-center px-5 border rounded h-fit
      border-gray-200 
      dark:border-gray-700
    ">
    <input 
      :checked="props.isChecked" 
      :id="props.idValue" 
      type="radio" 
      class="
        w-4 h-4 
        text-blue-600 bg-gray-100 border-gray-300 
        focus:ring-blue-500 focus:ring-2
        dark:bg-gray-700 dark:border-gray-600
        dark:focus:ring-blue-600 dark:ring-offset-gray-800 
      ">
    <label 
      :for="props.idValue" 
      class="
        w-full py-1 m-1.5 text-sm font-medium select-none 
        text-gray-900 
        dark:text-gray-300
      ">
      {{props.labelText}}
    </label>
  </div>
</template>
<script setup lang="ts">
  defineEmits(['click']);
    
  const props = defineProps<{  
    isChecked: boolean,
    labelText: string,
    idValue: string
  }>()


</script>