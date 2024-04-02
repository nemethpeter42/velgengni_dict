<template>
  <div class="flex items-center p-1">
    <div class="min-w-[6rem] w-[6rem] pl-[3rem] cursor-default select-none">
      <span
        v-if="savedExample.isGrammaticalExample" 
        class="
          me-2 px-2.5 py-1.5 rounded text-sm font-medium
          text-green-800 bg-green-100 
          dark:text-green-300 dark:bg-green-900
          ">G</span>
      <span v-else>&nbsp;</span>
    </div>
    <div
      class="
        text-gray-900 
        dark:text-gray-200
        max-w-[50rem]
      ">
    <b>{{savedExample.original}}</b><br>
    {{ savedExample.translated }}
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import type { SavedTranslationExample } from '../../../../libs/szotar_common/src/models/SavedTranslationExample';


  const props = defineProps({  
    savedExample: {type: Object, required: true,},
  })

  const savedExample = computed(() => props.savedExample as SavedTranslationExample)
</script>