<template>
  <div class="floating-action-buttons-on-example-modal
    relative ml-1 z-[100]
    flex flex-row items-end gap-2">
    <div class="w-9 flex flex-col items-stretch gap-2">
    <button
      :title="$t('actions.closeModal')"
      @click="modalStore.openModals.delete(`DICT_ENTRY_DETAILS-${props.dictStoreType}`)"
      class="
        floating-close-modal-btn
        text-white bg-orange-500 
        dark:bg-orange-600 
        w-9 h-9 rounded-full drop-shadow-lg
        flex justify-center items-center text-2xl 
        hover:drop-shadow-2xl hover:bg-orange-600
        dark:hover:bg-orange-500"
      data-button-for="close-modal"
      ><XMarkIcon class="h-6 w-6" /></button>

    <button 
      :title="$t('common.next')"
      @click="$emit(`nextBtnClick`)"
      class="
        floating-next-btn
        text-white bg-blue-600 
        w-9 h-14 rounded-full drop-shadow-lg
        flex justify-center items-center text-2xl 
        hover:drop-shadow-2xl hover:bg-blue-700
        dark:bg-blue-600
        dark:hover:bg-blue-500"
      data-button-for="next"
      ><ChevronRightIcon class="h-6 w-6" /></button>

    <button 
      :title="$t('actions.saveModifications')"
      @click="savedTrExampleStore.saveDb()"
      class="
        save-modifications-btn
        w-9 h-9 rounded-full drop-shadow-lg
        flex justify-center items-center text-2xl 
        hover:drop-shadow-2xl "
      :class="
        savedTrExampleStore.isDirty ? 
        ` 
          text-white bg-red-600 
          dark:bg-red-600
          hover:bg-red-700
          dark:hover:bg-red-500
          ` : `
          text-white bg-blue-600 
          dark:bg-blue-600
          hover:bg-blue-700
          dark:hover:bg-blue-500
        `"
      data-button-for="save-modifications"
      ><ArrowUpOnSquareStackIcon class="h-6 w-6" /></button>

    <div
      class="
        w-9 h-16 rounded-full drop-shadow-lg 
        flex flex-col
      "
    >
      <button 
        :title="$t('actions.scrollToTop')"
        class="
          scroll-to-top-btn
          inline-flex justify-center items-center text-2xl rounded-t-3xl p-0.5 pb-1 pt-1
          text-white bg-blue-600
          hover:drop-shadow-2xl hover:bg-blue-700
          dark:bg-blue-600
          dark:hover:bg-blue-500"
        data-button-for="scroll-to-top"
        @click="$emit(`scrollToTop`)"
      ><ArrowUpIcon class="h-6 w-6" /></button>
      <button 
        :title="$t('actions.scrollToBottom')"
        class="
          scroll-to-bottom-btn
          inline-flex justify-center items-center text-2xl rounded-b-3xl p-0.5 pt-1 pb-1
          text-white bg-blue-600
          hover:drop-shadow-2xl hover:bg-blue-700
          dark:bg-blue-600
          dark:hover:bg-blue-500"
        data-button-for="scroll-to-bottom"
        @click="$emit(`scrollToBottom`)"
      ><ArrowDownIcon class="h-6 w-6" /></button>
    </div>
    
    <button
      :title="$t('actions.moreButtons')"
      @click="isMoreButtonsOpen = !isMoreButtonsOpen"
      class="
        floating-toggle-more-btn
        hidden [@media(max-height:480px)]:flex
        text-white bg-blue-600
        w-9 h-9 rounded-full drop-shadow-lg
        justify-center items-center text-2xl
        hover:drop-shadow-2xl hover:bg-blue-700
        dark:bg-blue-600
        dark:hover:bg-blue-500"
      data-button-for="toggle-more"
      ><ToggleMoreFloatingButtonsMobileIcon class="h-6 w-6" /></button>

    <button
      :title="$t('actions.highlightButton')"
      @click="$emit(`highlightBtnClick`)"
      class="
        floating-highlight-btn
        [@media(max-height:480px)]:hidden
        text-white
        w-9 h-9 rounded-full drop-shadow-lg
        flex justify-center items-center text-2xl
        hover:drop-shadow-2xl"
      :class="highlightBtnColorClass"
      data-button-for="highlight"
      ><PaintBrushIcon class="h-6 w-6" /></button>

    <button
      :title="$t('actions.jumpToEntry')"
      @click="jumpToEntry(props.dictStoreType)"
      class="
        floating-jump-btn
        [@media(max-height:480px)]:hidden
        text-white bg-blue-600
        w-9 h-9 rounded-full drop-shadow-lg
        flex justify-center items-center text-2xl
        hover:drop-shadow-2xl hover:bg-blue-700
        dark:bg-blue-600
        dark:hover:bg-blue-500"
      data-button-for="jump"
      ><JumpToElementIcon class="h-6 w-6" /></button>
    </div>

    <!-- extra column, only on screens shorter than 480px -->
    <div
      v-if="isMoreButtonsOpen"
      class="
        floating-more-buttons-column
        hidden [@media(max-height:480px)]:flex
        w-9 flex-col items-stretch gap-2">
      <button
        :title="$t('actions.highlightButton')"
        @click="$emit(`highlightBtnClick`)"
        class="
          floating-highlight-btn
          text-white
          w-9 h-9 rounded-full drop-shadow-lg
          flex justify-center items-center text-2xl
          hover:drop-shadow-2xl"
        :class="highlightBtnColorClass"
        data-button-for="highlight-mobile"
        ><PaintBrushIcon class="h-6 w-6" /></button>
      <button
        :title="$t('actions.jumpToEntry')"
        @click="jumpToEntry(props.dictStoreType)"
        class="
          floating-jump-btn
          text-white bg-blue-600
          w-9 h-9 rounded-full drop-shadow-lg
          flex justify-center items-center text-2xl
          hover:drop-shadow-2xl hover:bg-blue-700
          dark:bg-blue-600
          dark:hover:bg-blue-500"
        data-button-for="jump-mobile"
        ><JumpToElementIcon class="h-6 w-6" /></button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { DictStoreType } from '@/frontend_models/DictStoreType';
import { useModalStore } from '@/stores/modal';
  import { useSavedTrExampleStore } from '@/stores/savedTrExample';
  import { useTranslationExampleStore } from '@/stores/translationExample';
  import { ArrowUpOnSquareStackIcon, ArrowUpIcon, ArrowDownIcon, XMarkIcon, ChevronRightIcon, PaintBrushIcon } from '@heroicons/vue/24/solid'
  import ToggleMoreFloatingButtonsMobileIcon from './tr-example/icons/ToggleMoreFloatingButtonsMobile.icon.vue';
  import JumpToElementIcon from './tr-example/icons/JumpToElement.icon.vue';
  import { jumpToEntry } from '@/helpers/jumpToEntry';
  import { computed, ref } from 'vue';

  const props = defineProps<{  
    isEntryHighlighted: boolean,
    dictStoreType: DictStoreType,
 }>();

  defineEmits(['nextBtnClick','scrollToTop','scrollToBottom',`highlightBtnClick`])

  const savedTrExampleStore = useSavedTrExampleStore();
  
  const trExampleStore = useTranslationExampleStore(props.dictStoreType === `dictModule` ? `dictModal` : `knowledgeModule`);
  const modalStore = useModalStore();

  const isMoreButtonsOpen = ref(false);

  const highlightBtnColorClass = computed(() => props.isEntryHighlighted ? `
      bg-orange-500
      hover:bg-orange-600
      dark:bg-orange-600
      dark:hover:bg-orange-500
    ` : `
      bg-blue-600
      hover:bg-blue-700
      dark:bg-blue-600
      dark:hover:bg-blue-500
    `);

  // deprecated. 
  // however, i keep it for possible future reuse
  const modeBtnClick = async () => {
    const conditions = trExampleStore.exampleFindReq.conditions;
    const conditionsClone = JSON.parse(JSON.stringify(conditions));
    for (const condition of conditionsClone) {
      if(conditions.every(c => c.onlyWithSpacePrefix && !c.onlyWithSpaceDotOrCommaSuffix)){
        condition.onlyWithSpaceDotOrCommaSuffix = true;
      } else if (conditions.every(c => c.onlyWithSpacePrefix && c.onlyWithSpaceDotOrCommaSuffix)) {
        condition.onlyWithSpacePrefix = false;
        condition.onlyWithSpaceDotOrCommaSuffix = false;
      } else {
        condition.onlyWithSpacePrefix = true;
        condition.onlyWithSpaceDotOrCommaSuffix = false;
      }
    }
    trExampleStore.exampleFindReq.conditions = conditionsClone;
    await trExampleStore.refreshExampleList(trExampleStore.exampleFindReq, false);
  }
</script>