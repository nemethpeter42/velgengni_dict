<template>
  <div 
    class="
      text-gray-900 
      dark:text-gray-300
    ">
    <hr class="h-px my-2 bg-gray-200 border-0 dark:bg-gray-600">
    <div class="flex flex-wrap">
      <div class="m-2">
        <div class="
          font-normal mx-1 my-3
          ">Látható oszlopok</div>
        <div  v-if="store.dictNameUsedInLastQuery">
          <div v-for="(colDef, colName) of store.currDictCols" v-bind:key="colName">
            <input type="checkbox"
              @click="store.toggleVisibility(colName)"
              :checked="colDef.isVisible"
              class="
                select-row-checkbox w-4 h-4 rounded 
                text-blue-600 bg-gray-100 border-gray-300 
                focus:ring-blue-500 focus:ring-2 
                dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
                dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800
              ">
            {{ colName }}
          </div>
        </div>
        <div
          class="
            font-normal mx-1 my-3
            text-red-800 
            dark:text-red-300
          " 
          v-else
          >Nincs aktív lekérdezés.</div>
      </div>
      <div class="m-2">
        
        <div class="
          font-normal mx-1 my-3
          ">Gyorskeresésnél használt oszlopok</div>
        <div  v-if="store.dictNameUsedInLastQuery">
          <div v-for="(colDef, colName) of store.currDictCols" v-bind:key="colName">
            <input type="checkbox"
              @click="store.toggleQuickSearchEnabled(colName)"
              :checked="colDef.isUsedInTrExampleSearch"
              class="
                select-row-checkbox w-4 h-4 rounded 
                text-blue-600 bg-gray-100 border-gray-300 
                focus:ring-blue-500 focus:ring-2 
                dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600
                dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800
              ">
            {{ colName }}
          </div>
        </div>
        <div
          class="
            font-normal mx-1 my-3
            text-red-800 
            dark:text-red-300
          " 
          v-else
          >Nincs aktív lekérdezés.</div>
      </div>
      
    </div>
  </div>
  <div 
      class="
        text-gray-900 
        dark:text-gray-300
      ">
    <hr class="h-px my-2 bg-gray-200 border-0 dark:bg-gray-600">
    <div class="
      font-normal mx-1 my-3
      ">Egyéb beállítások</div>
    <div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="store.displayColsAsRawString" class="sr-only peer">
        <div class="
          w-9 h-5 rounded-full peer 
          bg-gray-300 
          after:h-4 after:w-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:transition-all
          after:bg-white after:border-gray-300
          peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 
          peer-checked:bg-blue-600
          peer-checked:after:translate-x-full peer-checked:after:border-white
          dark:bg-gray-800 dark:border-gray-600
          dark:peer-focus:ring-blue-800 
        "></div>
        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Nyers sztring megjelenítés</span>
      </label>
    </div>
    <div class="mt-2">
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="store.displayRowNumbers" class="sr-only peer">
        <div class="
          w-9 h-5 rounded-full peer 
          bg-gray-300 
          after:h-4 after:w-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:transition-all
          after:bg-white after:border-gray-300
          peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 
          peer-checked:bg-blue-600
          peer-checked:after:translate-x-full peer-checked:after:border-white
          dark:bg-gray-800 dark:border-gray-600
          dark:peer-focus:ring-blue-800 
        "></div>
        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Sorszám megjelenítés</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDictStore } from '@/stores/dict';
  const store = useDictStore()
</script>