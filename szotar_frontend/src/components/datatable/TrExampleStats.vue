<template>
  <div class="stats text-gray-800 dark:text-gray-300">
    TOTAL: {{ store.exampleList.length }},
    <span :class="{'font-bold text-red-700': store.filteredEntries.length !== store.exampleList.length}">
      FILTERED:
    </span>
    {{ store.filteredEntries.length }},
    <span v-for="(item, index) of store.phrasesUsedInHighlight" :key="index">
      <SparklesIcon class="w-4 h-4 inline" :style="item.style" />
      {{ item.val }}: {{ countExamplesContainingThePhrase(item.val) }}{{ index!==store.phrasesUsedInHighlight.length-1 ? `, ` : ``}} 
    </span>
  </div>
</template>
<script setup lang="ts">
  import { useTranslationExampleStore } from '@/stores/translationExample';
  import { SparklesIcon, } from '@heroicons/vue/24/solid'

  const store = useTranslationExampleStore()

  const countExamplesContainingThePhrase = (phrase: string): number => {
    return store.filteredEntries.filter(e=>{
      return [
        phrase,
        phrase.replaceAll(/a$/gi,`á`).replaceAll(/e$/gi,`é`)
      ].some(phraseVariant =>
        e.val.example.toLowerCase().includes(phraseVariant.toLowerCase())
      )
    }).length
  }
</script>