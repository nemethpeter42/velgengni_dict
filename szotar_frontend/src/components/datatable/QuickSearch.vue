<template>
  <div>
    <div class="relative">
      <div
        v-if="!iconHidden" 
        class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <MagnifyingGlassIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true"/>
      </div>
      <label for="quick-search-examples" class="sr-only">Gyorskeresés</label>
      <input 
        type="text"  
        id="quick-search-examples"
        class="
          block p-2 pr-11 ml-2 w-80 text-sm border rounded-lg
          text-gray-900 border-gray-300 bg-gray-50 
          focus:ring-blue-500 focus:border-blue-500 
          dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
          dark:focus:ring-blue-500 dark:focus:border-blue-500
        "
        :class="{
          [`pl-3`]: iconHidden,
          [`pl-7`]: !iconHidden,
        }"
        :placeholder="label"
        :value="modelValue"
        @input="emitWithDebounce(($event?.target as HTMLInputElement)?.value)"
        >
      <div class="absolute inset-y-0 right-0 flex items-center pl-3.5">
        
        <button 
          @click="emitWithDebounce(``)"
          type="button" 
          class="
            px-1.5 py-1.5 mr-1
            font-medium rounded-lg text-sm 
            text-white bg-red-600 hover:bg-red-800 
            focus:ring-4 focus:ring-red-300 focus:outline-none 
            dark:bg-red-800 dark:hover:bg-red-700 
            dark:focus:ring-red-800
          ">
          <TrashIcon class="h-5 w-5 text-gray-100" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { MagnifyingGlassIcon, TrashIcon, } from '@heroicons/vue/24/solid'
  const emit = defineEmits(['update:modelValue']);
  let timeout: NodeJS.Timeout | undefined
  const emitWithDebounce = (val: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      emit('update:modelValue',val)
    }, 800);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = defineProps<{
    modelValue: string,
    iconHidden?: true,
    label: string,
  }>();
</script>