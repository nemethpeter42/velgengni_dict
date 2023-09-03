<template>
  <div class="stats text-gray-800 dark:text-gray-300">
    TOTAL: {{ store.exampleList.length }},
    <span :class="{'font-bold text-red-700': store.filteredEntries.length !== store.exampleList.length}">
      FILTERED:
    </span>
    {{ store.filteredEntries.length }},
    <span 
      v-for="(item, index) of store.phrasesUsedInHighlight" 
      :key="index"
      class="phrase-stat-container cursor-pointer"
      @click="$event => {
        store.quickSearchQueryPhrase = [store.quickSearchQueryPhrase, item.val].filter(e=>e.trim()!==``).join(`, `)
        store.jumpToPage(`FIRST`)
      }"
    >
      <SparklesIcon class="w-4 h-4 inline mr-1" :style="item.style" />
      <span class="stat-key">{{ item.val }}</span>:
      <span class="stat-val">{{ countExamplesContainingThePhrase(item.val) }}</span>{{ index!==store.phrasesUsedInHighlight.length-1 ? `, ` : ``}} 
    </span>
    <span class="text-blue-800 dark:text-blue-300">
      <!-- TODO ezeket vmi normalis helyre, backendrol lekerdezve megcsinalni-->
      &nbsp;
      <a :href="`https://www.google.com/search?q=${urlPhrase}+site%3A*.es&amp;tbm=isch`" target="_blank">google</a> &nbsp;
      <a :href="`https://en.wiktionary.org/wiki/${urlPhrase}#Spanish`" target="_blank">wiktionary</a> &nbsp;
      <a :href="`https://hu.wiktionary.org/wiki/${urlPhrase}#Spanyol`" target="_blank">wik_hu</a> &nbsp;
      <a :href="`https://www.collinsdictionary.com/dictionary/spanish-english/${urlPhrase}`" target="_blank">collins</a>
    </span>
  </div>
</template>
<script setup lang="ts">
  import { TrExampleStoreType } from '@/frontend_models/TrExampleStoreTypes';
import { useTranslationExampleStore } from '@/stores/translationExample';
  import { SparklesIcon, } from '@heroicons/vue/24/solid'
import { computed, defineProps } from 'vue';
  const props = defineProps({  
      storeId: {type: String, required: true,},
  })
  const store = useTranslationExampleStore(props.storeId)

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

  const urlPhrase = computed(() => store.exampleFindReq.conditions.map(e=>e.expression).join(` `))
</script>