<template>
  <div class="text-sm font-medium text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
    <div>
      <div class="text-gray-800 dark:text-gray-200 font-bold text-lg mb-4 mx-2">
        Flugnummer
      </div>
    </div>
    
    <div class="flex flex-wrap -mb-px">   
      <TabOption 
        text="Details" 
        :is-active="store.entryDetailsActiveTab === 1"
        @click="store.setEntryDetailsActiveTab(1)" 
      />
      <TabOption 
        text="Examples" 
        :is-active="store.entryDetailsActiveTab === 2"
        @click="store.setEntryDetailsActiveTab(2)" 
      />
      <TabOption 
        text="Saved examples" 
        :is-active="store.entryDetailsActiveTab === 3"
        @click="store.setEntryDetailsActiveTab(3)" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDictStore } from '@/stores/dict';
import TabOption from '../input-fields-and-buttons/TabOption.vue';
  const store = useDictStore()

</script>