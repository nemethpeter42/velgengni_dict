<template>
  <div 
    v-if="modalStore.openModals.has(`DICT_ENTRY_DETAILS`)"
    class="dict-entry-details-modal-container">
    <Teleport to="body">
    <div 
      class="
        fixed inset-0 z-[120]
        bg-gray-900 bg-opacity-50 
        dark:bg-opacity-80
      "></div>
    
    <div 
      id="dictEntryDetailsModal"  
      
      tabindex="-1" 
      aria-hidden="true" 
      :class="{
        flex: modalStore.openModals.has(`DICT_ENTRY_DETAILS`), 
        hidden: !modalStore.openModals.has(`DICT_ENTRY_DETAILS`),
      }" 
      class="
        p-4 fixed top-0 left-0 right-0 z-[130] overflow-x-hidden overflow-y-auto 
        w-full h-[calc(100%-1rem)] max-h-full justify-center items-start
        md:inset-0
      ">
      <!--
      <div 
        data-backdrop-for="dictEntryDetailsModal"
        @click="$event => triggerModalBackdrop($event)"
        class="
          fixed inset-0 z-[5]
          w-[60%]
          bg-transparent
        ">
      </div>-->
      <div 
        class="
          z-[15]
          fixed w-full max-w-[83rem] max-h-full
        ">
        <div style="
          position: fixed;
          height: 17rem;
          width: 5px;
          top: 50%;
          transform: translate(0px, -50%); 
        ">
          <FloatingActionButtonsOnExampleModal 
          @nextBtnClick="nextBtnClick()"
          @scrollToTop="scrollToTop()"
          @scrollToBottom="scrollToBottom()"

          />
        </div>
      </div>
      <div 
        class="
          scrollable-modal-content
          z-[10]
          relative w-full max-w-7xl max-h-full overflow-x-auto
        ">
        <div 
          class="
            relative rounded-lg shadow 
            bg-white 
            dark:bg-gray-700
          ">
          <div 
            class="
              p-6 pl-7 space-y-6
            ">
            <DictEntryDetailsModalContent />
          </div>
          <div 
            class="
              p-6 flex justify-between space-x-2 border-t rounded-b 
              border-gray-200 
              dark:border-gray-600
            ">
            <div>
              <button 
                @click="closeModal()" 
                type="button" 
                class="
                  px-5 py-2.5 rounded-lg border text-sm font-medium
                  text-gray-500 bg-white border-gray-200
                  hover:text-gray-900 hover:bg-gray-100 
                  focus:ring-4 focus:outline-none focus:ring-blue-300 focus:z-10 
                  dark:text-gray-300 dark:bg-gray-700 dark:border-gray-500 
                  dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600
                ">
                Bezárás
              </button>
            </div>
            <div>
                &nbsp;
            </div>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { useModalStore } from '@/stores/modal';
  import DictEntryDetailsModalContent from '../modal-content/DictEntryDetailsModalContent.vue';
  import FloatingActionButtonsOnExampleModal from '../input-fields-and-buttons/FloatingActionButtonsOnExampleModal.vue';
  import { useDictStore } from '@/stores/dict';
import { useTranslationExampleStore } from '@/stores/translationExample';
  
  const dictStore = useDictStore(`dictModule`);
  const modalStore = useModalStore()

  
  const triggerModalBackdrop = ($event: any) => {
    try {
      const attributes = 
        [...$event?.originalTarget?.attributes]?.
          map(e=>({name: e.name, value: e.value})) as {name: string, value: string}[];
      if (attributes.filter(e=>e.name===`data-backdrop-for`,`dictEntryDetailsModal`).length > 0) {
        modalStore.openModals.delete(`DICT_ENTRY_DETAILS`)
      }
      $event.stopPropagation();
    } catch(e) {
      /* eslint-disable no-empty */
    }
  }

  const closeModal = () => {
    modalStore.openModals.delete(`DICT_ENTRY_DETAILS`)
  }

  const scrollToTop = () => {
    document.querySelectorAll(`#dictEntryDetailsModal .scrollable-modal-content`)[0].scrollTo(0,0)
  }
  
  const scrollToBottom = () => {
    const mainContent = document.querySelectorAll(`#dictEntryDetailsModal .scrollable-modal-content`)[0]
    const bottomY = mainContent.scrollHeight;
    mainContent.scrollTo(0,bottomY)
  }

  const nextBtnClick = async () => {
    if(!dictStore.isTheLastEntryActive){
      scrollToTop();
      await new Promise((_) => setTimeout(_, 200));
      dictStore.setCurrentIdx(dictStore.currentIdx+1);
    }
  }
</script>