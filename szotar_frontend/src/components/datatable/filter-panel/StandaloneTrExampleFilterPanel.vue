<template>
  <div v-if="wordListStore.currentIdx !== -1" class="text-gray-800 dark:text-gray-200 m-2">{{ wordListStore.wordList[wordListStore.currentIdx]?.join(`\t`) }}</div>
  <div class="flex flex-wrap">
    <div>
      <label for="wordListModalOpenBtn" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Szóválasztó:</label>
      <button 
        id="wordListModalOpenBtn"
        class="
          m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center 
          text-white bg-blue-700 
          hover:bg-blue-800 
          focus:outline-none focus:ring-4 focus:ring-blue-300 
          dark:bg-blue-600 
          dark:hover:bg-blue-700 
          dark:focus:ring-blue-800
        "
        @click=" showWordListModal()"
      >Szóválasztó</button>
    </div>
    <div>
      <div>
        <label for="dropdownLangPair" class="block mb-2 text-sm font-semibold text-gray-700 dark:text-white">Nyelvpár:</label>
        <Dropdown>
          <template #trigger>
            <button 
              id="dropdownLangPair" 
              class="
                px-3 py-1.5 mx-2
                inline-flex items-center font-medium rounded-lg text-sm  
                text-gray-500 bg-white 
                border border-gray-300 
                focus:outline-none focus:ring-4 focus:ring-gray-200
                hover:bg-gray-100 
                dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 
                dark:hover:bg-gray-700 dark:hover:border-gray-600 
                dark:focus:ring-gray-700
              "
              type="button">
              {{`${wordListStore.currLang1} - ${wordListStore.currLang2}`}}
              <ChevronDownIcon class="w-3 h-3 ml-2" />
            </button>
          </template>
          <ul class="
            overflow-hidden w-48 rounded-lg text-sm font-medium border 
            text-gray-900 bg-white border-gray-200 
            dark:bg-gray-700 dark:border-gray-600 dark:text-white
            ">
            <li 
              v-for="(item, index) in wordListStore.languagePairs"
              :key="index"
              @click="wordListStore.currLang1=item.lang1;wordListStore.currLang2=item.lang2"
              class="
                block px-4 py-2 inline-flex items-center w-full border-b cursor-pointer
                border-gray-200 
                hover:bg-gray-100 hover:text-blue-700 
                focus:outline-none focus:ring-2 focus:text-blue-700 
                dark:border-gray-600 
                dark:hover:bg-gray-600 dark:hover:text-white 
                dark:focus:ring-gray-500 dark:focus:text-white
              ">
              <div class="mr-2"><FlagIcon class="w-4 h-4 fill-current" /></div> {{`${item.lang1} - ${item.lang2}`}}
            </li>
          </ul>
        </Dropdown>
      </div>

    </div>
  </div>


  
  <div v-if="isWordListModalShown">
      <div class="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40"></div>
      <div id="defaultModal"  tabindex="-1" aria-hidden="true" :class="{flex: isWordListModalShown, hidden: !isWordListModalShown,}" class="fixed top-0 left-0 right-0 z-50 w-full p-4  overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center">
        <div class="relative w-full max-w-5xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- Modal body -->
            <div class="p-2 space-y-6">
              <WordListModalContent 
                @close="closeWordListModal()"
              />
            </div>
            <div class="flex justify-between p-2 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <div>
                <button @click="closeWordListModal()" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                  Bezárás
                </button>
              </div>
              <div>
                  
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import WordListModalContent from '@/components/modal-content/WordListModalContent.vue'
  import {useWordListStore,} from '@/stores/wordList'
  import { Dropdown, } from 'flowbite-vue'
  import { ChevronDownIcon, FlagIcon, } from '@heroicons/vue/24/solid'
  const wordListStore = useWordListStore()
  
  const isWordListModalShown = ref(false)
  function closeWordListModal() {
    isWordListModalShown.value = false
  }
  function showWordListModal() {
    isWordListModalShown.value = true
  }

  onMounted(async () => {
    await wordListStore.refreshWordList()
    wordListStore.currentIdx =  0
    await wordListStore.refreshLanguagePairs()
    wordListStore.currLang1 = wordListStore.languagePairs[0]?.lang1 ?? ``
    wordListStore.currLang2 = wordListStore.languagePairs[0]?.lang2 ?? ``
  })


  

</script>