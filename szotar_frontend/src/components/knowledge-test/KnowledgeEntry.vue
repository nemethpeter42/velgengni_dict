<template>
  <div
  @click="() =>{
    if (highlightMode && !testMode) {
      $emit(`toggleHighlight`)
    }
  }"
  class="
    knowledge-entry
    border-[0.25rem] border-dashed p-0.5 mb-1
  "
  :class="{
    [`
      show-custom-border
      cursor-pointer select-none 
    `]: highlightMode && !testMode,
    [`
      highlighted
    `]: isHighlighted,
  }">
    <div 
      v-if="!testMode || isEntryRevealed || !originalIsAskedInTestMode"
      class="">
      <span
        class="original-col">
        {{ original }}
      </span>
    </div>
    <div 
      v-if="!testMode || isEntryRevealed || originalIsAskedInTestMode"
      class="translated-col">
      <MeaningForestViewer 
        v-if="translated"
        class="ml-5"
        :rawVal="translated"
        :inheritColor="true"
        :displayColsAsRawString="false" />
    </div>
    <div 
      v-if="testMode"
      class="pt-2 flex flex-wrap">
      <div
        class="py-1 pl-1 pr-1.5">
        <RevealEntryButton 
          @click="$emit(`revealEntry`)"
        />
      </div>
      <div
        v-if="false && testMode && isEntryRevealed"
        class="py-1 pl-1 pr-1.5">
        <HighlightRevealedEntryBtn
          @click="$emit(`toggleHighlight`)"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MeaningForestViewer from '../meaning-forest/MeaningForestViewer.vue';
import RevealEntryButton from '../input-fields-and-buttons/knowledge/RevealEntryButton.vue';
import HighlightRevealedEntryBtn from '../input-fields-and-buttons/knowledge/HighlightRevealedEntryBtn.vue';
  defineEmits<{
    revealEntry: [],
    toggleHighlight: [],
  }>();
  const props = defineProps<{
    original: string,
    translated: string,
    isHighlighted: boolean,
    originalIsAskedInTestMode: boolean,
    testMode: boolean,
    highlightMode: boolean,
    isEntryRevealed: boolean,
  }>();

</script>

<style scoped>
  .original-col {
    font-weight: bold;
    font-size: 1.15rem;
    background-color: rgba(0, 135, 255, 0.18);
  }

  .highlighted .original-col {
    background-color: rgba(231,231,0,0.25);
  }
 
  .knowledge-entry {
    border-color: transparent;
  }
  
  .knowledge-entry.show-custom-border {
    border-color: rgba(0, 135, 255, 0.18);
  }

  .knowledge-entry.show-custom-border.highlighted {
    border-color: rgba(231, 231, 0, 0.4);
  }
</style>