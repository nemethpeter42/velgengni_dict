<template>
  <div class="knowledge-main-control-panel text-gray-400 cursor-pointer select-none flex flex-wrap mx-1 my-0.5">
    <div class="flex flex-wrap my-0.5">
      <GenericMainPanelBtn 
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="open-saved-queries" 
        @click="resetScroll();showSavedQueriesModal();$emit(`resetTestMode`)"
        :primary="true">
        <OpenSavedQueriesIcon />
      </GenericMainPanelBtn>

      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="jump-to-first" 
        @click="resetScroll();store.jumpToPage(`FIRST`);">
        <JumpToFirstIcon />
      </GenericMainPanelBtn>

      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="jump-backward-by-some" 
        @click="resetScroll();incrementCurrPage(-store.pagesDisplayedInKnowledgeTest)"
        :primary="true">
          <JumpBackwardBySomeIcon />
          <div class="px-[2px]">{{ store.pagesDisplayedInKnowledgeTest }}</div>
      </GenericMainPanelBtn>

      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="jump-backward-by-one" 
        @click="resetScroll();incrementCurrPage(-1);"
        >
        <JumpBackwardByOneIcon />
      </GenericMainPanelBtn>

      <div class="
        flex items-center justify-end
        mx-1 px-1 min-w-[2rem] font-semibold
        bg-cyan-200 text-gray-800 opacity-75
        ">
        <div>{{ store.currentPageOneIncremented }}</div>
      </div>

      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="jump-forward-by-one" 
        @click="resetScroll();incrementCurrPage(1);">
        <JumpForwardByOneIcon />
      </GenericMainPanelBtn>

      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="jump-forward-by-some" 
        @click="resetScroll();incrementCurrPage(store.pagesDisplayedInKnowledgeTest)"
        :primary="true">
        <JumpForwardBySomeIcon />
        <div class="px-[2px]">{{ store.pagesDisplayedInKnowledgeTest }}</div>
      </GenericMainPanelBtn>

      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="jump-to-last" 
        @click="resetScroll();goToLastPage();">
        <JumpToLastIcon />
      </GenericMainPanelBtn>
    </div>
    <div class="flex flex-wrap my-0.5">
    
      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="results-per-page" 
        @click="resetScroll();store.resultsPerPage=(store.resultsPerPage===40 ? 80 : 40);store.jumpToPage(`FIRST`);$emit(`resetTestMode`)">
        <div v-if="store.resultsPerPage===80">40/<strong>80</strong></div>
        <div v-else-if="store.resultsPerPage===40"><strong>40</strong>/80</div>
        <div v-else>40/80</div>
      </GenericMainPanelBtn>

      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="prefilter-favorites-mode"
        @click="resetScroll();$emit(`togglePrefilter`);store.jumpToPage(`FIRST`)"
        :active="areFavoritesPrefiltered">
        <FilterIcon />
        <MultiplePagesIcon />
      </GenericMainPanelBtn>
      
      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="filter-favorites-mode"
        @click="resetScroll();$emit(`toggleMode`,`FILTER_FAVORITES`)"
        :active="mode.has(`FILTER_FAVORITES`)">
        <FilterIcon />
        <OnePageIcon />
      </GenericMainPanelBtn>
      
      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="mark-favorites-mode"
        @click="$emit(`toggleMode`,`MARK_FAVORITES`)"
        :active="mode.has(`MARK_FAVORITES`)">
        <MarkerIcon />
      </GenericMainPanelBtn>
      
      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="save-highlights"
        @click="favoritesStore.saveDb()"
        :danger="favoritesStore.isDirty">
        <SaveIcon />
      </GenericMainPanelBtn>
      
      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="decrement-number-of-pages"
        @click="resetScroll();incrementDisplayedPages(-1)">
        <OnePageIcon />
        <MinusIcon />
      </GenericMainPanelBtn>

      <GenericMainPanelBtn
        class="mx-[2px] w-[48px] py-[3px]"
        test-id="increment-number-of-pages"
        @click="resetScroll();incrementDisplayedPages(1)">
        <OnePageIcon />
        <PlusIcon />
      </GenericMainPanelBtn>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { KnowledgeModuleMode, KnowledgeModuleModeOption } from '@/frontend_models/KnowledgeModuleMode';
import { useDictStore } from '@/stores/dict';
import { useFavoritesStore } from '@/stores/highlight';
import { useModalStore } from '@/stores/modal';
import GenericMainPanelBtn from '../input-fields-and-buttons/knowledge/main-panel/GenericMainPanelBtn.vue';
import OpenSavedQueriesIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/OpenSavedQueriesIcon.vue';
import JumpBackwardByOneIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/JumpBackwardByOneIcon.vue';
import JumpBackwardBySomeIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/JumpBackwardBySomeIcon.vue';
import JumpToFirstIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/JumpToFirstIcon.vue';
import JumpToLastIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/JumpToLastIcon.vue';
import JumpForwardByOneIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/JumpForwardByOneIcon.vue';
import JumpForwardBySomeIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/JumpForwardBySomeIcon.vue';
import FilterIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/FilterIcon.vue';
import MultiplePagesIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/MultiplePagesIcon.vue';
import OnePageIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/OnePageIcon.vue';
import MarkerIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/MarkerIcon.vue';
import SaveIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/SaveIcon.vue';
import MinusIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/MinusIcon.vue';
import PlusIcon from '../input-fields-and-buttons/knowledge/main-panel/icons/PlusIcon.vue';

  defineEmits<{
    toggleMode: [modeOption: KnowledgeModuleModeOption],
    resetTestMode: [],
    togglePrefilter: [],
  }>();

  defineProps<{
    mode: KnowledgeModuleMode,
    areFavoritesPrefiltered: boolean,
  }>();

  const modalStore = useModalStore();

  const store = useDictStore(`knowledgeModule`);

  const favoritesStore = useFavoritesStore();
    
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