<template>
  <thead class="
    text-xs uppercase
    text-gray-700 bg-gray-100 
    dark:bg-gray-700 dark:text-gray-400
    ">
    <tr>
      <th scope="col" class="p-4">
        <div class="flex items-center">
          <input 
            v-if="!props.disableAllSelection"
            id="checkbox-all-search" 
            type="checkbox"
            :checked="props.isAllSelected"
            @click="$emit(`toggleAllSelection`)"
            class="
              w-4 h-4 border-double border-4 rounded
              text-fuchsia-600 bg-gray-100 border-gray-300 
              focus:ring-fuchsia-500 focus:ring-2 
              dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
              dark:focus:ring-fuchsia-600 dark:focus:ring-offset-gray-800"
              >
          <label for="checkbox-all-search" class="sr-only">checkbox</label>
        </div>
      </th>
      <th 
        scope="col" 
        class="px-2.5 py-3"
        v-for="(colDef,colName) of props.cols" v-bind:key="colName"
        @click="$emit(`toggleSort`,colName)"
      >
        <div class="flex">
        {{colName}}
        <ChevronUpIcon 
          v-if="props.sortCol===colName && props.sortAscending" 
          class="w-3 h-3 ml-1.5" 
          />
        <ChevronDownIcon 
          v-if="props.sortCol===colName && !props.sortAscending" 
          class="w-3 h-3 ml-1.5" 
          />
        </div>
      </th>
      <th scope="col" class="px-6 py-3">
        &nbsp;
      </th>
    </tr>
  </thead>
</template>
<script setup lang="ts">

  import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/solid'
  import { defineProps, defineEmits } from 'vue';
  defineEmits([`toggleSort`, `toggleAllSelection`,]);
    
  const props = defineProps({
      cols: {type: Object, required: true,},
      isAllSelected: { type: Boolean, required: true, },
      sortCol: { type: String, required: true, },
      sortAscending: {type: Boolean, required: true,},
      disableAllSelection: {type: Boolean, required: false,},
  });
</script>