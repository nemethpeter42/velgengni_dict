<template>
  <div
    class="knowledge-view prefer-serif overflow-hidden flex flex-col text-gray-900 dark:text-gray-100">
    <div class="max-w-[105rem] mx-auto">
      <KnowledgeTempMenu
        :mode="mode" 
        :areFavoritesPrefiltered = "store.areFavoritesPrefiltered"
        @toggleMode="val => toggleMode(val)" 
        @togglePrefilter="() => togglePrefilter()"
        @resetTestMode="pagesInTestMode.clear()"
      />
    </div>
    <div 
      class="flex overflow-hidden slightly-bigger-font almost-inverted-color"
      :style="`width: min(100vw,${(store.pagesDisplayedInKnowledgeTest ?? 1) * 28}rem);`">
      <KnowledgeColumn
        v-for="(item, index) of currPages"
        :key="index"
        :page="item"
        class="flex-1"
        :originalCol="currDictOriginalCol"
        :translatedCol="store.selectedMeaningForestCol"
        :uuidCol="currDictUuidCol"
        :dictName="store.dictNameUsedInLastQuery"
        :mode="mode"
        :testMode="pagesInTestMode.has(store.currentPageIdx + index)"
        @toggleTestMode="toggleTestMode(store.currentPageIdx + index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import KnowledgeColumn from '@/components/knowledge-test/KnowledgeColumn.vue';
import KnowledgeTempMenu from '@/components/knowledge-test/KnowledgeTempMenu.vue';
import type { KnowledgeModuleMode, KnowledgeModuleModeOption } from '@/frontend_models/KnowledgeModuleMode';
import { useDictStore } from '@/stores/dict';
import { computed, ref, type Ref } from 'vue';
  const mode: Ref<KnowledgeModuleMode> = ref(new Set());
  const toggleMode = (optionToToggle: KnowledgeModuleModeOption)  => {
    if (mode.value.has(optionToToggle)) {
      mode.value.delete(optionToToggle);
    } else {
      mode.value.add(optionToToggle);

    }
  }
  
  const store = useDictStore(`knowledgeModule`);


  const togglePrefilter = ()  => {
    store.areFavoritesPrefiltered = !store.areFavoritesPrefiltered;
  }
  
  const currDictOriginalCol = computed(
    () => store.dictQueriesWithMeta[store.dictNameUsedInLastQuery]?.meta?.originalCol ?? ``
  );
  const currDictUuidCol = computed(
    () => store.dictQueriesWithMeta[store.dictNameUsedInLastQuery]?.meta?.idCol ?? ``
  );
  const currPages = computed(
    () => 
      store.pagesOfFilteredEntries.
        slice(store.currentPageIdx,store.currentPageIdx + store.pagesDisplayedInKnowledgeTest).
        concat(
          Array.from({
            length: store.currentPageIdx + store.pagesDisplayedInKnowledgeTest - store.pagesOfFilteredEntries.length
          }, _ => []) 
        )
  )

  const pagesInTestMode = ref(new Set<number>())
  const toggleTestMode = 
    (idx: number) => 
      pagesInTestMode.value.has(idx)?
      pagesInTestMode.value.delete(idx):
      pagesInTestMode.value.add(idx);
</script>

<style scoped>
  .slightly-bigger-font {
    font-size: 1.1rem;
  }

  .almost-inverted-color{
    color: rgba(48, 3, 0, 0.9);
  }

  .almost-inverted-color:is(.dark *) {
    color: rgba(225,  228, 180, 1);
  }
 </style>
 
 <style> 
  .almost-inverted-color .translated-col strong:is(.dark *) {
    background-color: rgba(192,  192, 192, 0.12);
    padding-left: 1px;
    padding-right: 2px;
    padding-bottom: 1px;
  }
</style>