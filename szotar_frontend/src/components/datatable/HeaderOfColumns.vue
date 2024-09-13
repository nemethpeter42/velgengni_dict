<template>
  <thead class="
    text-xs uppercase
    text-gray-800 bg-gray-200 
    dark:bg-gray-600 dark:text-gray-300
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
              text-fuchsia-600 bg-gray-200 border-gray-400 
              focus:ring-fuchsia-500 focus:ring-2 
              dark:ring-offset-gray-700 dark:bg-gray-600 dark:border-gray-500
              dark:focus:ring-fuchsia-600 dark:focus:ring-offset-gray-700"
              >
          <label for="checkbox-all-search" class="sr-only">checkbox</label>
        </div>
      </th>
      <th 
        scope="col" 
        class="px-2.5 py-3 cursor-default select-none"
        v-for="col of props.columnDefinitions" v-bind:key="col.colName"
        @click="$emit(`toggleSort`,col.colName)"
      >
        <div class="flex">
        {{col.colName}}
        <ChevronUpIcon 
          v-if="props.sortCol===col.colName && props.sortAscending" 
          class="w-3 h-3 ml-1.5" 
          />
        <ChevronDownIcon 
          v-if="props.sortCol===col.colName && !props.sortAscending" 
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
<script lang="ts" setup>

  import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/solid'
  import { type ColumnDefinitionArrayForm } from '@/frontend_models/ColumnDefinitionArrayForm';
  
  defineEmits([`toggleSort`, `toggleAllSelection`,]);
    
  const props = defineProps<{
      columnDefinitions: ColumnDefinitionArrayForm[],
      isAllSelected: boolean,
      sortCol: string,
      sortAscending: boolean,
      disableAllSelection?: boolean,
  }>();

</script>