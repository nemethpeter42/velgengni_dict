<template>
  <div class="flex flex-wrap">
    <div class="m-1.5" v-for="(item, index) of visibleItems" :key="index">
      <div class="inline-flex rounded-lg shadow-sm" role="group">
        <button 
          class="
            px-3 py-2.5 font-medium text-sm text-center rounded-l-lg 
            text-gray-900  
            border border-gray-200 
            focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
            dark:text-gray-200 dark:border-0
            dark:border-gray-600 
            dark:hover:text-white
            dark:focus:ring-gray-700 
            "
            :class="{
              [`
                bg-fuchsia-200
                hover:bg-fuchsia-300
                dark:bg-fuchsia-800
                dark:hover:bg-fuchsia-700
              `] : !item.isInverseSearch,
              [`
                bg-sky-200
                hover:bg-sky-300
                dark:bg-sky-800
                dark:hover:bg-sky-700
              `] : item.isInverseSearch,

            }" 
            @click="$emit(`quickAccessSelected`, {words:item.words, isInverseSearch: item.isInverseSearch,})"
          >{{item.words.join(` `)}}</button>
        <button 
          class="
            px-2 py-2.5 ml-0.5 font-medium text-sm text-center
            text-gray-900 bg-gray-200 
            border border-gray-200 
            hover:bg-gray-300
            focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
            dark:bg-gray-800 dark:text-gray-200 dark:border-0
            dark:border-gray-600 
            dark:hover:text-white dark:hover:bg-gray-700
            dark:focus:ring-gray-700 
            "
            @click="$emit(`quickAccessSelected`, {words:item.words, isInverseSearch: item.isInverseSearch, onlyWithSpacePrefix: true,onlyWithSpaceDotOrCommaSuffix: true,})"
          > ␣~␣ </button>
        <button 
          class="
            px-4 py-2.5 ml-0.5 font-medium text-sm text-center rounded-r-lg 
            text-gray-900 bg-gray-200 
            border border-gray-200 
            hover:bg-gray-300
            focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
            dark:bg-gray-800 dark:text-gray-200 dark:border-0
            dark:border-gray-600 
            dark:hover:text-white dark:hover:bg-gray-700
            dark:focus:ring-gray-700 
            "
            @click="$emit(`quickAccessSelected`, {words:item.words, isInverseSearch: item.isInverseSearch, onlyWithSpacePrefix: true,})"
          > ␣~ </button>

      </div>
       
    </div>
    <div class="m-1.5">
      <button 
        v-if="!props.isAllDisplayed && allItems.length > props.defaultNumOfDisplayedItems"
        @click="$emit(`displayAll`)"
        class=" 
          px-4 py-2.5 font-medium text-sm text-center rounded-l-lg rounded-lg shadow-sm
          bg-cyan-200 text-gray-900  
          border border-gray-200 
          focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-200 
          hover:bg-cyan-300
          dark:bg-cyan-800 dark:text-gray-200 dark:border-0
          dark:border-gray-600 
          dark:hover:bg-cyan-700 dark:hover:text-white
          dark:focus:ring-gray-700 
        ">
        ...
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { type QuickAccessSelectionResult } from '@/frontend_models/QuickAccessSelectionResult';
  import { computed } from 'vue';
  defineEmits<{
    quickAccessSelected: [selection: QuickAccessSelectionResult ],
    displayAll: [],
  }>();
  const props = defineProps({  
    generator: {type: Array<string>, required: true,},
    defaultNumOfDisplayedItems: {type: Number, required: true,},
    isAllDisplayed: {type: Boolean, required: true,},
  });
  
  const allItems = computed(() => {
    const res: {words: string[], isInverseSearch: boolean}[] = []
    const lang1Phrases: string[] = 
      props.generator.
        filter(e=> !(e.trim().startsWith(`<`) && e.trim().endsWith(`>`))).
          map(e=>{
            let res = e;
            res = res.replaceAll(/\[[^\]]*\]/g,``);
            res = res.replaceAll(/\([^)]*\)/g,``);
            res = res.replaceAll(/\{[^}]*\}/g,``);
            res = res.trim()
            return res;
          })

    const lang2Phrases: string[] = 
      props.generator.
        filter(e=> e.trim().startsWith(`<`) && e.trim().endsWith(`>`)).
        map(e=>{
          let res = e;
          res = res.replaceAll(/\[[^\]]*\]/g,``);
          res = res.replaceAll(/\([^)]*\)/g,``);
          res = res.replaceAll(/\{[^}]*\}/g,``);
          res = res.replaceAll(/\\/g,``);
          res = res.replaceAll(/\s*#@[-a-zA-Z0-9]+/g,``)
          // kacsacsorok eltavolitasa
          res = res.substring(1,res.length-1)
          res = res.split(`*`).join(``)
          res = res.split(`\\`).join(``)
          //elvalasztok egybevonasa, majd szetvalasztas
          res = res.split(`/`).join(`;`)
          res = res.split(`,`).join(`;`)
          const splittedPhrases = res.split(`;`)
          return splittedPhrases
        }).
        flat().
				map(e=>e.trim()).
				filter(e=>e!==``)
      ;
    for(const item of lang1Phrases) {
      res.push({
        words: item.split(` `).map(e=>e.trim()).filter(e=>e!==``), 
        isInverseSearch: false,
      })
    }
    for(const item of lang2Phrases) {
      res.push({
        words: item.split(` `).map(e=>e.trim()).filter(e=>e!==``), 
        isInverseSearch: true,
      })
    }
    return res;
  })
  const visibleItems = computed(() => {
    return props.isAllDisplayed ? allItems.value : allItems.value.slice(0, props.defaultNumOfDisplayedItems)
  })
</script>