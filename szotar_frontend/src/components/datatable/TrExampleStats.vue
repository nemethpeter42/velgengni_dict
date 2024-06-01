<template>
  <div class="relative stats text-gray-800 dark:text-gray-300">
    <DtSpinner 
      v-if="store.isGeneratedLinksLoading" 
      test-id="tr-example-stats"
    />
    <!-- TODO create an error notification/snackbar message-->
    <span 
      class="font-bold text-red-700"
      v-if="store.lastTrExampleQueryErrored">
      ERR!
    </span>
    TOTAL: {{ store.exampleList.length }},
    <span :class="{'font-bold text-red-700': store.filteredEntries.length !== store.exampleList.length}">
      FILTERED:
    </span>
    {{ store.filteredEntries.length }},
    <span 
      v-for="(item, index) of store.phrasesUsedInHighlight" 
      :key="index"
      class="phrase-stat-container cursor-pointer"
      @click="$event => addToQuickSearch([item.val])"
    >
      <SparklesIcon class="w-4 h-4 inline mr-1" :style="item.style" />
      <span class="stat-key">{{ item.val }}</span>:
      <span class="stat-val">{{ countExamplesContainingThePhrase(item.val) }}</span>{{ index!==store.phrasesUsedInHighlight.length-1 ? `, ` : ``}} 
    </span>
    <span 
      class="phrase-stat-container cursor-pointer ml-1"
      @click="addToQuickSearch(store.bigFilterLastQueryVal)">
      <Squares2X2Icon class="w-4 h-4 inline mr-1" />
      [Mind]
    </span>
    <span class="text-blue-800 dark:text-blue-300">
      <!-- TODO ezeket vmi normalis helyre, backendrol lekerdezve megcsinalni-->
      &nbsp;
      <span
        v-for="(link,index) of store.generatedLinks" 
        :key="index"
      >
        <a
          :href="link.url" 
          target="_blank">
          {{link.title}}
        </a>
        &nbsp;
      </span>
    </span>
  </div>
</template>
<script lang="ts" setup>
import { useTranslationExampleStore } from '@/stores/translationExample';
  import { SparklesIcon, Squares2X2Icon, } from '@heroicons/vue/24/solid'
import { computed } from 'vue';
import DtSpinner from './DtSpinner.vue';
import type { TrExampleStoreType } from '@/frontend_models/TrExampleStoreTypes';
  const props = defineProps<{  
      storeId: TrExampleStoreType,
  }>()
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

  const addToQuickSearch = (phrases: string[]) => {
    store.setQuickSearchQueryPhrase([store.quickSearchQueryPhrase, ...phrases].filter(e=>e.trim()!==``).join(`, `))
    store.jumpToPage(`FIRST`)
  }

  const urlPhrase = computed(() => store.exampleFindReq.conditions.map(e=>e.expression).join(` `))
</script>