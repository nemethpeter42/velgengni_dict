<template>
  <div class="new-saved-example-editor flex flex-wrap">
    <button 
      v-if="!savedTrExStore.newElemEditor.visible"
      class="
        make-editor-visible-btn
        m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center
        text-gray-900 bg-yellow-200 
        border border-gray-200 
        hover:bg-yellow-300
        focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
        dark:bg-cyan-800 dark:text-gray-200 dark:border-0
        dark:border-gray-600 
        dark:hover:text-white dark:hover:bg-cyan-700
        dark:focus:ring-gray-700 
        "
      @click="openEditor()"
      >+ Új mentett példa</button>
    <div
      v-if="savedTrExStore.newElemEditor.visible" 
      class="m-1"
      >
      <input 
        v-model="savedTrExStore.newElemEditor.original"
        class="
          w-96 px-3 py-2 
          shadow-sm border block text-sm rounded-lg
          bg-gray-50 text-gray-900 border-gray-300 
          focus:ring-blue-500 focus:border-blue-500  
          dark:shadow-sm-light dark:placeholder-gray-400 
          dark:bg-gray-700 dark:text-white dark:border-gray-600 
          dark:focus:ring-blue-500 dark:focus:border-blue-500
        " 
        placeholder="Szöveg (forrásnyelv)"
        >
    </div>
    <div
      v-if="savedTrExStore.newElemEditor.visible" 
      class="m-1"
      >
      <input 
        v-model="savedTrExStore.newElemEditor.translated"
        class="
          w-96 px-3 py-2 
          shadow-sm border block text-sm rounded-lg
          bg-gray-50 text-gray-900 border-gray-300 
          focus:ring-blue-500 focus:border-blue-500  
          dark:shadow-sm-light dark:placeholder-gray-400 
          dark:bg-gray-700 dark:text-white dark:border-gray-600 
          dark:focus:ring-blue-500 dark:focus:border-blue-500
        " 
        placeholder="Szöveg (célnyelv)"
        >
    </div>
    <button 
      v-if="savedTrExStore.newElemEditor.visible"
        class="
          submit-btn
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center
          text-gray-900 bg-yellow-200 
          border border-gray-200 
          hover:bg-yellow-300
          focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
          dark:bg-cyan-800 dark:text-gray-200 dark:border-0
          dark:border-gray-600 
          dark:hover:text-white dark:hover:bg-cyan-700
          dark:focus:ring-gray-700 
          "
        @click="createSavedTrExample()"
        >Rögzítés</button>
  </div>
</template>
<script setup lang="ts">
import { useDictStore } from '@/stores/dict';
import { useSavedTrExampleStore } from '@/stores/savedTrExample';
import { ref } from 'vue';
import { Example } from '../../../../libs/szotar_common/src/models/Example';
import { SavedTranslationExample } from '../../../../libs/szotar_common/src/models/SavedTranslationExample';
  const savedTrExStore = useSavedTrExampleStore();
  const store = useDictStore()
  
  const openEditor = async () => {
    savedTrExStore.newElemEditor = {
    visible: true,
    original: ``,
    translated: ``,
    isLowPriority: false,
    isLoading: false,
}
  }

  const createSavedTrExample = async () => {
    const dictName = store.dictNameUsedInLastQuery;
    await savedTrExStore.create(
      dictName,
      {
        original: savedTrExStore.newElemEditor.original,
        translated: savedTrExStore.newElemEditor.translated,
        uuid: ``,
        dictEntryUuid: store.currentUuid,
        isLowPriority: false,
      } as SavedTranslationExample
    );
  }
</script>