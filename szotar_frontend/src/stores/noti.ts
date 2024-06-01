import type { Noti } from "@/frontend_models/Noti"
import { defineStore } from "pinia"
import { type Ref, ref } from "vue"

export const useNotiStore = defineStore(`noti`, () => {
  
  const notifications: Ref<Noti[]> = ref([])
/*
[
  {
    type:`info`,
    msg:`In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content.`
  },
  {
    type:`error`,
    msg:`An unexpected error occured!`
  }
]
*/  
  const hidingAnimationDuration = 700;

  const hideNoti = (index: number) => {
      if (notifications.value[index] && !notifications.value[index].hidingAnimationClasses)
      
      notifications.value[index].hidingAnimationClasses = [
        `transition-opacity`,
        `ease-out`,
        `opacity-0`,
      ].join(` `)
      setTimeout(() => {
        notifications.value[index].hidingAnimationClasses = `${notifications.value[index].hidingAnimationClasses} hidden` 
      }, hidingAnimationDuration);

      
  }

  return {
    notifications,
    hideNoti,
    hidingAnimationDuration,
  }
})