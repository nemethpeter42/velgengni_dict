
<template>
  <div>
    <div class="flex flex-wrap ">
        <div class="m-2"> 
          <label for="command" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Keresési parancs:</label>
          <textarea 
            id="command" 
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
            v-model="backendSearchQuery"
          ></textarea>
          <div class="text-gray-600 dark:text-gray-400 text-sm my-1">Pl.&nbsp; e.original.trim().toLowerCase().includes(`cat`)</div>
        </div>
        <div class="m-2">
          <label for="command" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Szótár:</label>
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
              v-bind:key="val" 
              :selected="store.dictNameOnForm===val" 
              @click="store.setDictNameOnForm(val);"
              >{{val}}</option>
          </select>
        </div>
        <div class="m-2"> 
          <label for="command" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Rendezési függvény:</label>
          <textarea 
            id="command" 
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
            v-model="customSortComparison"
          ></textarea>
          <div class="text-gray-600 dark:text-gray-400 text-sm my-1">Pl.&nbsp; -1*a.original.localeCompare(b.original, `es`)</div>
        </div>
      </div>

      <button 
        class="
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center 
          text-white bg-blue-700 
          hover:bg-blue-800 
          focus:outline-none focus:ring-4 focus:ring-blue-300 
          dark:bg-blue-600 
          dark:hover:bg-blue-700 
          dark:focus:ring-blue-800
        "
        @click=" executeBackendSearch()"
      >Keresés</button>

  </div>
</template>
<script lang="ts" setup>
import { useDictStore } from '@/stores/dict';
import { Ref, ref } from 'vue';

  const store = useDictStore()

  async function executeBackendSearch() {
    await store.refreshEntries(backendSearchQuery.value, customSortComparison.value)
    store.selectedIndices.clear()
    store.jumpToPage(`FIRST`)
  }
  
  const backendSearchQuery: Ref<string> = ref(``)
  const customSortComparison: Ref<string> = ref(``)

</script>