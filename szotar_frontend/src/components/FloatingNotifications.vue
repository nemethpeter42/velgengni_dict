<template>
  <div 
    class="
      floating-notifications-container
      absolute z-[200] right-0 top-0
    ">
    <div 
      v-for="(noti, index) of notiStore.notifications"
      :key="index"
      :id="`floating-notification-${index + 1}`"
      :style="`transition-duration: ${notiStore.hidingAnimationDuration}ms;`"
      :class="notiStore.notifications[index].hidingAnimationClasses ?? ``"
    >
      <div  
        class="
          p-4 m-2 border rounded-lg w-96
        " 
        :class="{
          [`
            text-blue-800 bg-blue-50 border-blue-300 
            dark:text-blue-400 dark:bg-gray-800 dark:border-blue-800
          `]:noti.type===`info`,
          [`
            text-red-800 bg-red-50 border-red-300 
            dark:text-red-400 dark:bg-gray-800 dark:border-red-800
          `]:noti.type===`error`,
        }"
        role="alert">
  
        <div class="mt-2 mb-4 text-sm">
          {{ noti.msg }}
        </div>
        <div class="flex">
          <button 
            @click="notiStore.hideNoti(index)"
            type="button" 
            class="
              px-3 py-1.5 border font-medium rounded-lg text-sm text-center
              focus:outline-none focus:ring-4
            " 
            :class="{
              [`
                text-blue-800 bg-transparent border-blue-800 
                hover:text-white hover:bg-blue-900 
                focus:ring-blue-200  
                dark:text-blue-400 dark:border-blue-600 
                dark:hover:text-white dark:hover:bg-blue-600
                dark:focus:ring-blue-800
              `]: noti.type===`info`,
              [`
                text-red-800 bg-transparent border-red-800 
                hover:text-white hover:bg-red-900 
                focus:ring-red-300 
                dark:text-red-500 dark:border-red-600 
                dark:hover:text-white dark:hover:bg-red-600
                dark:focus:ring-red-800
              `]: noti.type===`error`,
            }"
            aria-label="Close">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotiStore } from '@/stores/noti';

  const notiStore = useNotiStore()
/*
TODO implement it with ease-out effect
close it based on unique id, like noti-08
maybe you have to use reverse order
some help for coding:

const Default: DismissOptions = {
    transition: 'transition-opacity',
    duration: 300,
    timing: 'ease-out',
    onHide: () => {},
};

  hide() {
        this._targetEl.classList.add(
            this._options.transition,
            `duration-${this._options.duration}`,
            this._options.timing,
            'opacity-0'
        );
        setTimeout(() => {
            this._targetEl.classList.add('hidden');
        }, this._options.duration);

        // callback function
        this._options.onHide(this, this._targetEl);
    }
*/
</script>
