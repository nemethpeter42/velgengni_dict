<template>
  <div class="knowledge-column overflow-y-auto">
    <div
      class="
        col-for-existing-page
        pl-0.5 pr-0.5
      "
      v-if="filteredPage.length"
    >
      <div class="p-1.5">
        <TestModeButton 
          @click="revealedEntries.clear(); $emit(`toggleTestMode`)"
        />
        <div>=====</div>
      </div>
      <div
        v-for="(item, index) of filteredAndSortedPage"
        :key="index">
        <KnowledgeEntry
          :original="item.val[originalCol]"
          :translated="translatedCol ? item.val[translatedCol] : ``"
          :isHighlighted="highlightStore.isHighlighted(dictName, item.val[uuidCol])"
          :originalIsAskedInTestMode="originalIsAskedInTestMode.has(index)"
          :testMode="testMode"
          :isEntryRevealed="revealedEntries.has(index)"
          @revealEntry="revealedEntries.add(index)"
          :highlightMode="mode.has(`HIGHLIGHT`)"
          
          @toggleHighlight="() => {
            highlightStore.toggle(dictName, item.val[uuidCol]);
          }"
        />
        <div class="item-separator">=====</div>
      </div>
    </div>
    <div 
      v-else
      class="empty-col-for-nonexisting-page select-none">
      &nbsp;
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FilteredEntry } from '@/frontend_models/FilteredEntry';
import { useHighlightStore } from '@/stores/highlight';
import type { KnowledgeModuleMode } from '@/frontend_models/KnowledgeModuleMode';
import { computed, ref } from 'vue';
import TestModeButton from '../input-fields-and-buttons/knowledge/TestModeButton.vue';
import KnowledgeEntry from './KnowledgeEntry.vue';
  defineEmits<{toggleTestMode: []}>();

  const highlightStore = useHighlightStore();

  const props = defineProps<{
    page: FilteredEntry[],
    dictName: string,
    originalCol: string,
    translatedCol?: string,
    uuidCol: string,
    mode: KnowledgeModuleMode,
    testMode: boolean,
  }>();

  const filteredPage = computed(
    () => props.mode.has(`FILTER_HIGHLIGHTED`)? props.page.filter(e => highlightStore.isHighlighted(props.dictName,e.val[props.uuidCol])) : props.page 
  );

  const shuffleArray = <T>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr
  };

  const filteredAndSortedPage = computed(
    () => props.testMode ? shuffleArray([...filteredPage.value]): filteredPage.value
  );

  const percentageWhenOriginalIsAsked = 70;

  const originalIsAskedInTestMode = computed(
    () => {
      if (props.testMode) {
        const res = shuffleArray([...filteredAndSortedPage.value.keys()]);
        return new Set<number>(
          res.slice(
            Math.floor(
              (1-percentageWhenOriginalIsAsked / 100)*res.length
            )
          )
        );
      } else {
        return new Set<number>();
      }
    }
  );

  const revealedEntries = ref(new Set<number>());
</script>
