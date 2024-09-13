<template>
  <div class="flex items-center p-1">
    <div class="min-w-[6rem] w-[6rem] pl-[3rem] cursor-default select-none">
      <span
        v-if="props.savedExample.isOfHighImportance" 
        class="
          me-2 px-2.5 py-1.5 rounded text-sm font-medium
          text-green-800 bg-green-100 
          dark:text-green-300 dark:bg-green-900
          ">H</span>
      <span
        v-if="props.savedExample.isOfLowImportance" 
        class="
          me-2 px-2.5 py-1.5 rounded text-sm font-medium
          text-orange-800 bg-orange-100 
          dark:text-orange-300 dark:bg-orange-900
          ">H</span>
      <span v-else>&nbsp;</span>
    </div>
    <div
      class="
        text-gray-900 
        dark:text-gray-200
        max-w-[50rem]
      ">
    <b>{{props.savedExample.original}}</b><br>
    {{ props.savedExample.translated }}
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import type { SavedTranslationExample } from '../../../../libs/szotar_common/src/models/SavedTranslationExample';


  const props = defineProps<{  
    savedExample: SavedTranslationExample,
  }>();
</script>