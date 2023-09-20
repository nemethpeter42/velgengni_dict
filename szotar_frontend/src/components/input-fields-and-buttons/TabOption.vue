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
    >{{props.text}}</div>
</template>

<script setup lang="ts">

   defineEmits(['click']);
    
  const props = defineProps({  
    text: {type: String, required: true,},
    isActive: {type: Boolean, required: true,},
  })

</script>