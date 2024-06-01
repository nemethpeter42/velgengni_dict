<template>
  <div 
    class="
      text-gray-900 
      dark:text-gray-300
    ">
    <div 
      class="
        font-normal mx-1 my-3
      ">Mentett lekérdezések
    </div>
    <div class="flex flex-wrap">
      <button 
        v-for="(item, index) of savedDictQueryStore.entries"
        :key="index"
        :id="`saved-dict-query-item-${index}`"
        @click="() => {
          modalStore.openModals.delete(modalStoreId)  
          savedDictQueryStore.querySelected(item)
        }"
        class="
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center
          text-gray-900 bg-white 
          border border-gray-200 
          hover:bg-gray-100 hover:text-blue-700 
          focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
          dark:bg-gray-800 dark:text-gray-400 
          dark:border-gray-600 
          dark:hover:text-white dark:hover:bg-gray-700
          dark:focus:ring-gray-700 
          "
        >
        {{item.title}}
      </button>  
    </div>
  </div>
  <div
      v-if="props.type===`dictModule`" 
      class="
        text-gray-900 
        dark:text-gray-300
      ">
    <hr 
      class="
        my-2 h-px border-0 
        bg-gray-200 
        dark:bg-gray-600
      ">
    <div 
      class="
        font-normal mx-1 my-3
      ">Új létrehozása (a jelenlegi adatokból)
    </div>
    <div 
      class="flex flex-wrap items-end">
      <div class="flex flex-col m-2">
        <label 
          for="newSavedQueryTitle"
          class="
            block mb-2 text-sm font-semibold select-none
            text-gray-700 
            dark:text-white
          ">
        Mentett szűrő neve:
        </label>
        <input 
          v-model="savedDictQueryStore.newElemEditor.title"
          id="newSavedQueryTitle"
          class="
            w-96 px-3 py-2 
            shadow-sm border block text-sm rounded-lg
            bg-gray-50 text-gray-900 border-gray-300 
            focus:ring-blue-500 focus:border-blue-500  
            dark:shadow-sm-light dark:placeholder-gray-400 
            dark:bg-gray-700 dark:text-white dark:border-gray-600 
            dark:focus:ring-blue-500 dark:focus:border-blue-500
          " 
          placeholder="">
      </div>
      <div class="m-1">
      <WordListPrevNextButton 
        id="newSavedQuerySubmitBtn"
        text="Rögzítés"
        :isDisabled="!savedDictQueryStore.newElemIsValid"
        @click="savedDictQueryStore.create()"
      />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useSavedDictQueryStore } from '@/stores/savedDictQuery';
  import WordListPrevNextButton from '../input-fields-and-buttons/WordListPrevNextButton.vue';
  import { useModalStore } from '@/stores/modal';
  import { type DictStoreType } from '@/frontend_models/DictStoreType';
  const props = defineProps<{
    type:DictStoreType,
    modalStoreId:"SAVED_QUERIES" | "SAVED_QUERIES_KNOWLEDGE",
  }>()
  const savedDictQueryStore = useSavedDictQueryStore();
  const modalStore = useModalStore();

</script>