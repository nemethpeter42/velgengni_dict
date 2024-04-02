<template>

  <div 
    class="flex items-center m-1"
    @click="$emit(`update:modelValue`, !!!props.modelValue)"
    > 
      <input 
        :id="props.idValue"
        type="checkbox" 
        :checked="props.modelValue"
        class="
          w-4 h-4 rounded 
          text-blue-600 bg-gray-100 border-gray-300
          focus:ring-2 
          focus:ring-blue-500 
          dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
          dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800 
        ">
      <label 
        @click="$emit(`update:modelValue`, !!!props.modelValue)"
        :for="props.idValue" 
        class="
          ml-2 text-sm font-medium select-none
          text-gray-900 
          dark:text-gray-300
        ">
        {{props.labelText}}
      </label>
    </div>
</template>
<script setup lang="ts">
  defineEmits([`click`, `update:modelValue`]);
    
  const props = defineProps({  
    modelValue: {type: Boolean, required: true,},
    labelText: {type: String, required: true,},
    idValue: {type: String, required: true,}
  })


</script>