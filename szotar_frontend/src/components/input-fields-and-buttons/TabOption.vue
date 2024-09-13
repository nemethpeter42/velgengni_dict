<template>
  <div  
    class="
      inline-block p-4 mr-2 cursor-pointer select-none
      border-b-2 rounded-t-lg 
    "
    :class="{
      [`
        text-blue-600 border-blue-600 
        dark:text-blue-500 dark:border-blue-500
      `] : props.isActive, 
      [`
        border-transparent
        hover:text-gray-600 hover:border-gray-300 
        dark:hover:text-gray-300
      `] : !props.isActive, 
    }"
    @click="$emit(`click`)"
    >{{props.text}}
    <span
      v-if="props.labelText!==undefined" 
      class="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
      {{ props.labelText }}
    </span>
  </div>
</template>

<script setup lang="ts">

   defineEmits(['click']);
    
  const props = defineProps<{  
    text: string,
    isActive: boolean,
    labelText?: number,
  }>()

</script>