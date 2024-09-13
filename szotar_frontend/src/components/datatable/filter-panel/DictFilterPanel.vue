
<template>
  <div>
    <div class="flex flex-wrap ">
        <div class="m-2"> 
          <label for="searchQuery" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Keresési parancs:</label>
          <textarea 
            id="searchQuery" 
            rows="2" 
            class="
              block p-2.5 w-96 text-sm rounded-lg resize-none
              text-gray-900 bg-gray-50
              border border-gray-300 
              focus:ring-blue-500 focus:border-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
              dark:focus:ring-blue-500 dark:focus:border-blue-500 
            " 
            placeholder='Keresési parancs'
            v-model="store.searchQuery"
          ></textarea>
          <div class="text-gray-600 dark:text-gray-400 text-sm my-1">Pl.&nbsp; e.original.trim().toLowerCase().includes(`cat`)</div>
        </div>
        <div class="m-2">
          <label for="dictName" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Szótár:</label>
          <select 
            id="dictName" 
            class="
              w-80 p-2 text-sm border rounded-lg 
              text-gray-900 border-gray-300 bg-gray-50 
              focus:ring-blue-500 focus:border-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
              dark:focus:ring-blue-500 dark:focus:border-blue-500
            "
          >
            <option 
              v-for="val in Object.keys(store.dictQueriesWithMeta)" 
              :key="val" 
              :selected="store.dictNameOnForm===val" 
              @click="store.setDictNameOnForm(val);"
              >{{val}}</option>
          </select>
        </div>
        <div class="m-2"> 
          <label for="sortComparison" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Rendezési függvény:</label>
          <textarea 
            id="sortComparison" 
            rows="2" 
            class="
              block p-2.5 w-96 text-sm rounded-lg resize-none
              text-gray-900 bg-gray-50
              border border-gray-300 
              focus:ring-blue-500 focus:border-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
              dark:focus:ring-blue-500 dark:focus:border-blue-500 
            " 
            placeholder='Rendezési függvény'
            v-model="store.sortComparison"
          ></textarea>
          <div class="text-gray-600 dark:text-gray-400 text-sm my-1">Pl.&nbsp; -1*a.original.localeCompare(b.original, `es`)</div>
        </div>
      </div>

      <ExecuteDictQueryBtn
        @click=" store.executeBackendSearch()"
        />
      <OpenSavedQueriesModalBtn 
        @click=" showSavedQueriesModal()"
        />


  </div>
</template>
<script lang="ts" setup>
  import ExecuteDictQueryBtn from '@/components/input-fields-and-buttons/ExecuteDictQueryBtn.vue';
  import OpenSavedQueriesModalBtn from '@/components/input-fields-and-buttons/OpenSavedQueriesModalBtn.vue';
  import { useDictStore } from '@/stores/dict';
  import { useModalStore } from '@/stores/modal';
  import { type Ref, ref } from 'vue';

  const store = useDictStore(`dictModule`);

  const modalStore = useModalStore();
    
  const showSavedQueriesModal = () => {
    modalStore.openModals.add(`SAVED_QUERIES`)
  }

</script>