<template>
  <div>
    <div class="flex flex-wrap lg:flex-nowrap" v-for="(item, index) in props.modelValue" :key="index">
      <div class="flex items-center m-2">
        <input 
          :id="`prefix-space-checkbox-${index + 1}`"
          type="checkbox" 
          v-model="item.onlyWithSpacePrefix"
          class="
            w-4 h-4 rounded 
            text-blue-600 bg-gray-100 border-gray-300
            focus:ring-2 
            focus:ring-blue-500 
            dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
            dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800 
          ">
        <label 
          :for="`prefix-space-checkbox-${index + 1}`" 
          class="
            ml-2 text-sm font-medium select-none
            text-gray-900 
            dark:text-gray-300
          ">
          prefix space
        </label>
      </div>
      <div class="m-2">
        <input 
          :id="`expr-of-condition-${index}`" 
          v-model="item.expression"
          class="
            w-70 px-3 py-2 
            shadow-sm border block text-sm rounded-lg
            bg-gray-50 text-gray-900 border-gray-300 
            focus:ring-blue-500 focus:border-blue-500  
            dark:shadow-sm-light dark:placeholder-gray-400 
            dark:bg-gray-700 dark:text-white dark:border-gray-600 
            dark:focus:ring-blue-500 dark:focus:border-blue-500
          " 
          placeholder="Keresési kifejezés"
          >
      </div>
      <div class="flex items-center m-2">
        <input 
          :id="`postfix-space-checkbox-${index + 1}`"
          type="checkbox" 
          v-model="item.onlyWithSpaceDotOrCommaSuffix"
          class="
            w-4 h-4 rounded 
            text-blue-600 bg-gray-100 border-gray-300
            focus:ring-2 
            focus:ring-blue-500 
            dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
            dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800 
          ">
        <label 
          :for="`postfix-space-checkbox-${index + 1}`" 
          class="
            ml-2 text-sm font-medium select-none
            text-gray-900 
            dark:text-gray-300
          ">
          postfix space/írásjel
        </label>
      </div>
      <div class="m-2">
        <RemoveConditionButton 
          @click="$emit('update:modelValue',modelValue.filter((e,i)=>{return i!==index;}))"
        />
      </div>
    </div>
    <div>
      <button 
        id="addSearchConditionButton"
        class="
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center
          text-gray-900 bg-yellow-200 
          border border-gray-200 
          hover:bg-yellow-300
          focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
          dark:bg-cyan-800 dark:text-gray-200 dark:border-0
          dark:border-gray-600 
          dark:hover:text-white dark:hover:bg-cyan-700
          dark:focus:ring-gray-700 
          "
        @click="$emit('update:modelValue',modelValue.concat([{onlyWithSpaceDotOrCommaSuffix: false,onlyWithSpacePrefix: false, expression: ``}]))"
        >+ Új feltétel</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { type SearchCondition } from '../../../../libs/szotar_common/src/models/SearchCondition';
  import RemoveConditionButton from './RemoveConditionButton.vue';
  defineEmits(['update:modelValue']);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = defineProps<{
    modelValue: SearchCondition[],
  }>();

</script>