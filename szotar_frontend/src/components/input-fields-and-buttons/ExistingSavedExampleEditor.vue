<template>
  <div class="existing-saved-example-editor flex flex-column flex-wrap">
    <div
      class="m-1"
      >
      <input 
        v-model="savedTrExStore.existingElemEditor.original"
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
      class="m-1"
      >
      <input 
        v-model="savedTrExStore.existingElemEditor.translated"
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
        @click="updateSavedTrExample()"
        >Rögzítés</button>
  </div>
</template>
<script setup lang="ts">
import { useSavedTrExampleStore } from '@/stores/savedTrExample';
import { ref } from 'vue';
import { SavedTranslationExample } from '../../../../libs/szotar_common/src/models/SavedTranslationExample';
import { useDictStore } from '@/stores/dict';
const savedTrExStore = useSavedTrExampleStore();
  const store = useDictStore()
  

  const updateSavedTrExample = async () => {
    const dictName = store.dictNameUsedInLastQuery;
    await savedTrExStore.update(
      dictName,
      {
        original: savedTrExStore.existingElemEditor.original,
        translated: savedTrExStore.existingElemEditor.translated,
        uuid: savedTrExStore.existingElemEditor.uuid,
        dictEntryUuid: ``,
        isLowPriority: savedTrExStore.existingElemEditor.isLowPriority,
      } as SavedTranslationExample
    );
  }
</script>