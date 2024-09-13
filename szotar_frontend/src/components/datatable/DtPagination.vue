<template>
  <ul class="inline-flex items-center -space-x-px">
    <li>
      <span class="sr-only">Első</span>
      <button 
        aria-hidden="true"
        @click="$emit('jumpToPage','FIRST');"
        :disabled="props.isFirstPage"
        class="
          px-3.5 py-2.5 
          leading-tight border
        "
        :class="{
          [`
            cursor-not-allowed 
            bg-gray-50 border-gray-300 text-gray-300 
            dark:text-gray-700 dark:bg-gray-900 dark:border-gray-700
          `]: props.isFirstPage, 
          [`
            bg-gray-50 border-gray-300 text-gray-500 
            hover:bg-gray-100 hover:text-gray-700 
            dark:bg-gray-800 dark:border-gray-700 
            dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white
          `]: !props.isFirstPage,
        }"
        >&#x23EE;</button>
    </li>
    <li>
      <span class="sr-only">Előző</span>
      <button
        aria-hidden="true"
        @click="$emit('jumpToPage','PREVIOUS');"
        :disabled="props.isFirstPage"
        class="px-3.5 py-2.5 leading-tight border"
        :class="{
          [`
            cursor-not-allowed 
            bg-gray-50 border-gray-300 text-gray-300 
            dark:text-gray-700 dark:bg-gray-900 dark:border-gray-700
          `]: props.isFirstPage, 
          [`
            bg-gray-50 border-gray-300 text-gray-500 
            hover:bg-gray-100 hover:text-gray-700 
            dark:bg-gray-800 dark:border-gray-700 
            dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white
          `]: !props.isFirstPage,
        }"
        >&#x23F4;</button>
    </li>
    <li class="z-10">
      <input 
        aria-current="page"
        class="
          px-3 py-2.5 w-16 
          leading-tight border border-dashed 
        "
        :value="modelValue"
        @input="$emit('update:modelValue', ($event?.target as HTMLInputElement)?.value)"
        :class="{ 
          [`
            text-blue-600 border-blue-300 bg-blue-50 
            hover:bg-blue-100 hover:text-blue-700 
            dark:text-white dark:border-gray-700 dark:bg-gray-700   
          `]: isGivenInputAValidPage,
          [`
            text-red-600 border-red-300 bg-red-50 
            hover:bg-red-100 hover:text-red-700 
            dark:text-white dark:border-red-700 dark:bg-red-700   
          `]: !isGivenInputAValidPage,
        }"
        >
    </li>
    <li>
      <span class="sr-only">Következő</span>
      <button 
        aria-hidden="true"
        @click="$emit('jumpToPage','NEXT');"
        :disabled="props.isLastPage"
        class="px-3.5 py-2.5 leading-tight border"
        :class="{
          [`
            cursor-not-allowed 
            bg-gray-50 border-gray-300 text-gray-300 
            dark:text-gray-700 dark:bg-gray-900 dark:border-gray-700
          `]: props.isLastPage, 
          [`
            bg-gray-50 border-gray-300 text-gray-500 
            hover:bg-gray-100 hover:text-gray-700 
            dark:bg-gray-800 dark:border-gray-700 
            dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white
          `]: !props.isLastPage,
        }"
        >&#x23F5;</button>
    </li>
    <li>
      <span class="sr-only">Utolsó</span>
      <button 
        aria-hidden="true"
        @click="$emit('jumpToPage','LAST');"
        :disabled="props.isLastPage"
        class="px-3.5 py-2.5 leading-tight border"
        :class="{
          [`
            cursor-not-allowed 
            bg-gray-50 border-gray-300 text-gray-300 
            dark:text-gray-700 dark:bg-gray-900 dark:border-gray-700
          `]: props.isLastPage, 
          [`
            bg-gray-50 border-gray-300 text-gray-500 
            hover:bg-gray-100 hover:text-gray-700 
            dark:bg-gray-800 dark:border-gray-700 
            dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white
          `]: !props.isLastPage,
        }"
        >&#x23ED;</button>
    </li>
  </ul>
</template>

<script lang="ts" setup>
  defineEmits(['update:modelValue', `jumpToPage`]);
  
  const props = defineProps<{
    modelValue: string,
    isFirstPage: boolean,
    isLastPage: boolean,
    isGivenInputAValidPage: boolean,
  }>();
</script>