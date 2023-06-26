<template>
  <div>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <MagnifyingGlassIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true"/>
      </div>
      <label for="table-search" class="sr-only">Gyorskeresés</label>
      <input 
        type="text"  
        id="table-search-users"
        class="
          block p-2 pl-7 ml-2 w-80 text-sm border rounded-lg
          text-gray-900 border-gray-300 bg-gray-50 
          focus:ring-blue-500 focus:border-blue-500 
          dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
          dark:focus:ring-blue-500 dark:focus:border-blue-500
        "
        placeholder="Gyorskeresés"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event?.target as HTMLInputElement)?.value)"
        >
        
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  import { MagnifyingGlassIcon, } from '@heroicons/vue/24/solid'
  defineEmits(['update:modelValue']);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = defineProps({
    modelValue: {type: String, required: true,},
  })
</script>