<template>
  <div>
    <div text="Tömeges műv.">
          <button 
            id="dropdownActionButton" 
            class="
              px-3 py-1.5 mx-2
              inline-flex items-center font-medium rounded-lg text-sm  
              text-gray-500 bg-white 
              border border-gray-300 
              focus:outline-none focus:ring-4 focus:ring-gray-200
              hover:bg-gray-100 
              dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 
              dark:hover:bg-gray-700 dark:hover:border-gray-600 
              dark:focus:ring-gray-700
            "
            type="button">
            <span class="sr-only">Tömeges műveletek</span>
            Tömeges műv.
            <ChevronDownIcon class="w-3 h-3 ml-2" />
          </button>
        <ul
          class="
              hidden TODO-fix-it
              overflow-hidden w-48 rounded-lg text-sm font-medium border 
              text-gray-900 bg-white border-gray-200 
              dark:bg-gray-700 dark:border-gray-600 dark:text-white
            ">
          <li class="
            block px-4 py-2 inline-flex items-center w-full border-b cursor-pointer
            border-gray-200 
            hover:bg-gray-100 hover:text-blue-700 
            focus:outline-none focus:ring-2 focus:text-blue-700 
            dark:border-gray-600 
            dark:hover:bg-gray-600 dark:hover:text-white 
            dark:focus:ring-gray-500 dark:focus:text-white
            ">
            <div class="mr-2"><CloudArrowDownIcon class="w-4 h-4 fill-current" /></div> Interaktív HTML export
          </li>
        </ul>
      </div>
  </div>
</template>

<script setup lang='ts'>
  import { ChevronDownIcon, CloudArrowDownIcon } from '@heroicons/vue/24/solid'
</script>