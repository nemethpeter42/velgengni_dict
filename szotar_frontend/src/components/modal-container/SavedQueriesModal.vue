<template>
  <div 
    v-if="modalStore.openModals.has(modalStoreId)"
    class="saved-queries-modal-container">
    <Teleport to="body">
    <div 
      class="
        fixed inset-0 z-[120]  
        bg-gray-900 bg-opacity-50 
        dark:bg-opacity-80 
      "></div>
    <div 
      :id="`savedQueriesModal-${type}`"  
      :data-backdrop-for="`savedQueriesModal-${type}`"  
      @click="$event => triggerModalBackdrop($event)"
      tabindex="-1" 
      aria-hidden="true" 
      :class="{
        flex: modalStore.openModals.has(modalStoreId), 
        hidden: !modalStore.openModals.has(modalStoreId),
      }" 
      class="
        p-4 fixed top-0 left-0 right-0 z-[130] overflow-x-hidden overflow-y-auto 
        w-full h-[calc(100%-1rem)] max-h-full justify-center items-center
        md:inset-0 
      ">
      <div 
        class="
          relative w-full max-w-5xl max-h-full overflow-x-auto
        ">
        <div 
          class="
            relative rounded-lg shadow 
            bg-white 
            dark:bg-gray-700
          ">
          
          <div 
            class="
              p-6 space-y-6
            ">
            <SavedQueriesModalContent 
              :type="type"
              :modalStoreId="modalStoreId"
            />
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
  import TableConfiguration from '../modal-content/TableConfiguration.vue';
  import SavedQueriesModalContent from '../modal-content/SavedQueriesModalContent.vue';
  import { type DictStoreType } from '@/frontend_models/DictStoreType';
  const props = defineProps<{
    type:DictStoreType,
  }>()
  const modalStore = useModalStore()
  const modalStoreId = props.type===`dictModule` ? `SAVED_QUERIES` : `SAVED_QUERIES_KNOWLEDGE`;
  
  const triggerModalBackdrop = ($event: any) => {
    try {
      const attributes = 
        [...$event?.originalTarget?.attributes]?.
          map(e=>({name: e.name, value: e.value})) as {name: string, value: string}[];
      if (attributes.filter(e=>e.name===`data-backdrop-for`,`savedQueriesModal`).length > 0) {
        modalStore.openModals.delete(modalStoreId)
      }
      $event.stopPropagation();
    } catch(e) {
      /* eslint-disable no-empty */
    }
  }

  const closeModal = () => {
    modalStore.openModals.delete(modalStoreId)
  }
  
</script>