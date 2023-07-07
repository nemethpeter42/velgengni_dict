<template>
  <tbody>
    <tr
      v-for="(item, rowIndex) in (props.onePageOfEntries as FilteredEntry[])" 
      v-bind:key="item.idx" 
      class="
        border-b
        
      "
      :class="{
        [`
          bg-gray-50 
          hover:bg-gray-200
          dark:bg-gray-900 dark:border-gray-700 
          dark:hover:bg-gray-600
        `]: rowIndex % 2 === 0,
        [`
          bg-gray-100
          hover:bg-gray-200
          dark:bg-gray-800 dark:border-gray-700 
          dark:hover:bg-gray-600
        `]: rowIndex % 2 !== 0,
        }"
      >
      <td class="w-4 pl-4 pr-2 py-1.5">
        <div class="flex items-center">
          <input type="checkbox"
            v-if="!props.disableRowSelectionCheckbox"
            @click="$emit(`toggleRowSelection`,item.idx,$event)"
            :checked="props.selectedIndices.has(item.idx)"
            class="
              select-row-checkbox w-4 h-4 rounded 
              text-fuchsia-600 bg-gray-100 border-gray-300 
              focus:ring-fuchsia-500 focus:ring-2 
              dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
              dark:focus:ring-fuchsia-600 dark:focus:ring-offset-gray-800
            ">
            <slot name="rowLevelButtons" :idx="item.idx"></slot>
          <label for="select-row-checkbox" class="sr-only">Sor kiválasztása</label>
        </div>
      </td>
      <td 
        scope="row" 
        class="px-2.5 py-1.5 font-medium text-gray-900 dark:text-gray-100" 
        v-for="(colDef,colName) of (props.columnDefinitions as Record<string, ColumnDefinition>)" 
        v-bind:key="colName" 
        :class="colDef?.tailwindClasses ?? ``"
        >
        <MeaningForestViewer 
          v-if="colDef.isMeaningForestCol" 
          :raw-val="item.val.translated" 
          :displayColsAsRawString="props.displayColsAsRawString" 
          />
        <div v-else>{{item.val[colName]}}</div>
      </td>
      <td class="
        px-6 py-2 max-w-40 font-medium 
        text-gray-800 
        dark:text-gray-200
      ">
        <!--ghost column-->
        
      </td>
    </tr>
  </tbody>
</template>

<script setup lang="ts">
  
  import MeaningForestViewer from '@/components/meaning-forest/MeaningForestViewer.vue';
  import { ColumnDefinition } from '../../../../libs/szotar_common/src/models/ColumnDefinition';


  import { defineProps, defineEmits } from 'vue';
  import { FilteredEntry } from '@/frontend_models/FilteredEntry';
  defineEmits(['toggleRowSelection']);
    
  const props = defineProps({  
    selectedIndices: {type: Set, required: true,},
    onePageOfEntries: { type: Array, required: true, },
    columnDefinitions: { type: Object, required: true, },
    displayColsAsRawString: {type: Boolean, required: false,},
    disableRowSelectionCheckbox: {type: Boolean, required: false,},
  });
</script>@/frontend_models/FilteredEntry