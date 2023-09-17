<template>
  <span 
    class="
      text-sm font-normal 
      text-gray-500 
      dark:text-gray-400
      ">Nyelvpár: </span>
  
  <button 
    :id="props.idOfToggleBtn" 
    :data-dropdown-toggle="props.idOfOptionList" 
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
    {{props.toggleBtnText}}
    <ChevronDownIcon class="w-3 h-3 ml-2" />
  </button>
  <div :id="props.idOfOptionList" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
    <ul class="
      overflow-hidden rounded-lg text-sm font-medium border 
      text-gray-900 bg-white border-gray-200 
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      ">
      <li 
        v-for="(item, index) in props.languagePairs"
        :key="index"
        @click="($event) => {
            $emit(`optionSelected`, item.lang1, item.lang2)
            closeDropdown(props.idOfToggleBtn)
          }"
        class="
          block px-4 py-2 inline-flex items-center w-full border-b cursor-pointer select-none
          border-gray-200 
          hover:bg-gray-100 hover:text-blue-700 
          focus:outline-none focus:ring-2 focus:text-blue-700 
          dark:border-gray-600 
          dark:hover:bg-gray-600 dark:hover:text-white 
          dark:focus:ring-gray-500 dark:focus:text-white
        ">
        <div class="mr-2"><FlagIcon class="w-4 h-4 fill-current" /></div> {{`${item.lang1} - ${item.lang2}`}}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
  import { LanguagePair } from '@/frontend_models/LanguagePair';
  import { ChevronDownIcon, FlagIcon, } from '@heroicons/vue/24/solid'
  
  // eslint-disable-next-line no-undef
  defineEmits([`optionSelected`])

  // eslint-disable-next-line no-undef
  const props = defineProps({  
    toggleBtnText: {type: String, required: true,},
    idOfToggleBtn: { type: String, required: true, },
    idOfOptionList: { type: String, required: true, },
    languagePairs: {type: Array<LanguagePair>, required: true,},
  });

  
  const closeDropdown = (toggleElementId: string) => {
    const dropdownToggleElement = document.getElementById(toggleElementId)
    const clickEvent = new MouseEvent("click", {
      "view": window,
      "bubbles": true,
      "cancelable": false
    });
    dropdownToggleElement?.dispatchEvent(clickEvent);
  }
  
</script>