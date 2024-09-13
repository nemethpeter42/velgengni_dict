<template>
  <div class="flex m-1 max-w-3xl">
    <input 
      id="big-filter-input" 
      class="
        flex-1
        px-3 py-2 mx-1 max-w-[48rem]
        shadow-sm border block text-sm rounded-lg
        bg-gray-50 text-gray-900 border-gray-300 
        focus:ring-blue-500 focus:border-blue-500  
        dark:shadow-sm-light dark:placeholder-gray-400 
        dark:bg-gray-700 dark:text-white dark:border-gray-600 
        dark:focus:ring-blue-500 dark:focus:border-blue-500
      " 
      placeholder="Nagy szűrő"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event?.target as HTMLInputElement)?.value)"
      v-on:keyup.enter="$emit(`goButtonClicked`)"
      >
      <button 
        class="flex-0 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        @click="$emit(`goButtonClicked`)"
        > 
        <ArrowRightIcon  class="w-6 h-6 fill-current"/>
      </button>
    
  </div>
</template>
<script lang="ts" setup>
  import { ArrowRightIcon, } from '@heroicons/vue/24/solid'
  defineEmits(['update:modelValue','goButtonClicked']);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = defineProps<{
    modelValue: string,
  }>();
</script>