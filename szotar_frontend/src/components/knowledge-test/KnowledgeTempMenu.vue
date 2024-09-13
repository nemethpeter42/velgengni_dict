<template>
  <div class="knowledge-temp-menu text-gray-400 cursor-pointer select-none flex flex-wrap">
    <a 
      class="m-1"
      @click="resetScroll();showSavedQueriesModal();$emit(`resetTestMode`)">
      load
    </a>
    <a 
      class="m-1"
      @click="resetScroll();store.jumpToPage(`FIRST`);">
      first
    </a>
    <a 
      class="m-1"
      @click="resetScroll();incrementCurrPage(-store.pagesDisplayedInKnowledgeTest);">
      prev x{{store.pagesDisplayedInKnowledgeTest}}
    </a>
    <a 
      class="m-1"
      @click="resetScroll();incrementCurrPage(-1)">
      prev
    </a>
    <div class="
      m-1 min-w-[2rem] text-right
      ">{{store.currentPageOneIncremented}}</div>
    <a 
      class="m-1"
      @click="resetScroll();incrementCurrPage(1)">
      next
    </a>
    <a 
      class="m-1"
      @click="resetScroll();incrementCurrPage(store.pagesDisplayedInKnowledgeTest)">
      next x{{store.pagesDisplayedInKnowledgeTest}}
    </a>
    <a 
      class="m-1"
      @click="resetScroll();goToLastPage()">
      last
    </a>
    <a 
      class="m-1"
      @click="resetScroll();store.resultsPerPage=(store.resultsPerPage===40 ? 80 : 40);store.jumpToPage(`FIRST`);$emit(`resetTestMode`)">
      <span v-if="store.resultsPerPage===80">40/<strong>80</strong></span>
      <span v-else-if="store.resultsPerPage===40"><strong>40</strong>/80</span>
      <span v-else>40/80</span>
    </a>
    <a 
      class="m-1"
      @click="resetScroll();$emit(`toggleMode`,`FILTER_HIGHLIGHTED`)">
      <span v-if="mode.has(`FILTER_HIGHLIGHTED`)"><strong>filter</strong></span>
      <span v-else>filter</span>
    </a>
    <a 
      class="m-1"
      @click="$emit(`toggleMode`,`HIGHLIGHT`)">
      <span v-if="mode.has(`HIGHLIGHT`)"><strong>mark</strong></span>
      <span v-else>mark</span>
    </a>
    <a
      :class="{
        [`font-bold text-red-400 dark:text-red-600`]:highlightStore.isDirty, 
      }" 
      @click="highlightStore.saveDb()"
      class="m-1">
      save_hl
    </a>
    <a 
      class="m-1"
      @click="resetScroll();incrementDisplayedPages(-1)">
      decr
    </a>
    <a 
      class="m-1"
      @click="resetScroll();incrementDisplayedPages(1)">
      incr
    </a>
  </div>
</template>

<script setup lang="ts">
  import type { KnowledgeModuleMode, KnowledgeModuleModeOption } from '@/frontend_models/KnowledgeModuleMode';
import { useDictStore } from '@/stores/dict';
import { useHighlightStore } from '@/stores/highlight';
import { useModalStore } from '@/stores/modal';
  defineEmits<{
    toggleMode: [modeOption: KnowledgeModuleModeOption],
    resetTestMode: [],
  }>();

  defineProps<{
    mode: KnowledgeModuleMode,
  }>();

  const modalStore = useModalStore();

  const store = useDictStore(`knowledgeModule`);

  const highlightStore = useHighlightStore();
    
  const showSavedQueriesModal = () => {
    modalStore.openModals.add(`SAVED_QUERIES_KNOWLEDGE`)
  }

  const incrementDisplayedPages = (offset: -1 | 1) => {
    const res = store.pagesDisplayedInKnowledgeTest + offset;
    if (res>=1 && res<=8) {
      store.pagesDisplayedInKnowledgeTest = res;
      store.jumpToPage(`FIRST`);
    }
  };

  const incrementCurrPage = (offset: number) => {
    const res: number = store.currentPageIdx + offset;
    if (res>=0 && res<store.pagesOfFilteredEntries.length){
      store.currentPageIdx = res;
    } else if (res<0 && store.pagesOfFilteredEntries.length) {
      store.currentPageIdx= 0;
    }
  }

  const goToLastPage = () => {
    const nonEmptyOffset = store.pagesOfFilteredEntries.length ? -1 : 0
    store.currentPageIdx = 
      store.pagesDisplayedInKnowledgeTest *
      Math.floor((store.pagesOfFilteredEntries.length + nonEmptyOffset) / store.pagesDisplayedInKnowledgeTest);
  }

  const resetScroll = () =>
    [...document.querySelectorAll(`.knowledge-column`)].map(e=>e.scrollTo(0,0)); 
</script>

<style scoped>

</style>