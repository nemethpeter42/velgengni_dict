<template>
  <div 
    class="
      main-content
      h-screen w-screen
      bg-cyan-50 
      dark:bg-indigo-950
      flex flex-col justify-start
    "
    :class="{
      [`
        overflow-hidden
      `]: modalStore.openModals.size > 0 || route.name===`knowledge`,
      [`
        overflow-auto
      `]: !(modalStore.openModals.size > 0) && route.name!==`knowledge`,
    }">
    <div class="flex justify-center">  
    <div 
      class="max-w-[105rem] grow">
      <FloatingActionButtons />
      <FloatingNotifications />
      <SavedQueriesModal type="knowledgeModule"/>
      <SavedQueriesModal type="dictModule"/>
      <ExportModal />
      <TableConfigurationModal />
      <DictEntryDetailsModal />
      <WordListModal />
      
      <nav class="m-auto text-center">
        <router-link 
          class="font-bold" 
          :class="route.name===`home` ? `text-green-500 dark:text-green-400` : `text-gray-500 dark:text-gray-400`" 
          to="/"
          >Dictionaries
        </router-link> |
        <router-link 
          class="font-bold" 
          :class="route.name===`knowledge` ? `text-green-500 dark:text-green-400` : `text-gray-500 dark:text-gray-400`" 
          to="/knowledge"
          >Knowledge
        </router-link> |
        <router-link 
          class="font-bold" 
          :class="route.name===`examples` ? `text-green-500 dark:text-green-400` : `text-gray-500 dark:text-gray-400`" 
          to="/examples"
          >Examples
        </router-link> |
        <!--<router-link 
          class="font-bold" 
          :class="route.name===`about` ? `text-green-500 dark:text-green-400` : `text-gray-500 dark:text-gray-400`" 
          to="/about"
          >Sandbox
        </router-link>-->
        <button 
          id="theme-toggle" 
          type="button" 
          @click="darkMode = !darkMode"
          class="
            ml-2 border-4 rounded-lg text-sm px-1.5 py-1.5
            text-gray-500 border-gray-200 
            hover:bg-gray-100 
            focus:outline-none focus:ring-4 focus:ring-gray-200 
            dark:text-gray-400 dark:border-gray-600 
            dark:hover:bg-gray-700 
            dark:focus:ring-gray-700">
          <MoonIcon class="w-5 h-5" :class="{'hidden':!darkMode,}"></MoonIcon>
          <SunIcon class="w-5 h-5" :class="{'hidden':darkMode,}"></SunIcon>
        </button>

      
      </nav>
      </div>
    </div>
    <div
      class="
        p-1
        flex flex-col
        items-center
        self-center
        grow
      "
      :class="{
        [`
          max-w-[105rem]
        `]: route.name!==`knowledge`,
        [`
          overflow-hidden
        `]: route.name===`knowledge`,
      }"
      >
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { type WritableComputedRef, computed, onMounted, ref } from 'vue'
  import { initFlowbite } from 'flowbite'
  import { MoonIcon, SunIcon } from '@heroicons/vue/24/solid'
  import { useRoute } from 'vue-router';
  import { useModalStore } from './stores/modal';
  import FloatingActionButtons from './components/input-fields-and-buttons/FloatingActionButtons.vue';
  import FloatingNotifications from './components/FloatingNotifications.vue';
  import SavedQueriesModal from './components/modal-container/SavedQueriesModal.vue';
  import TableConfigurationModal from './components/modal-container/TableConfigurationModal.vue';
  import DictEntryDetailsModal from './components/modal-container/DictEntryDetailsModal.vue';
  import WordListModal from './components/modal-container/WordListModal.vue';
import ExportModal from './components/modal-container/ExportModal.vue';

  const modalStore = useModalStore();
  const darkModeRef = ref(false)

  const darkMode: WritableComputedRef<boolean> = computed({
    get(): boolean {
      return darkModeRef.value
    },
    set(newVal: boolean): void {
      // set something
      if (newVal) {
        //console.log(`enabling dark`);
        localStorage.setItem(`color-theme`, `dark`);
        document.documentElement.classList.add('dark');
        darkModeRef.value = true;
      } else {
        //console.log(`disabling dark`)
        localStorage.setItem(`color-theme`, `light`);
        document.documentElement.classList.remove('dark');
        darkModeRef.value = false;
      }
    },
  });
  
  // initialize components based on data attribute selectors
  onMounted(() => {
    initFlowbite();
    darkMode.value = localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  })

  const route = useRoute()


</script>

<style lang="scss">

#app {
  overflow: hidden;
  width: 100%;
  height: 100%;

}
body{
  font-family: Helvetica, Arial, Liberation Sans, Avenir, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  overflow: hidden;
  height: 100%;
  width: 100%;
}

</style>
