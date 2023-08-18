<template>
   <button 
    type="button" 
    @click="$emit(`wordSelected`, props.idx)"
    class="
      px-0.5 py-0.5 mx-2 border-2
      font-medium rounded-lg text-sm 
      text-white border-blue-700 hover:border-blue-800 
      focus:ring-4 focus:ring-blue-300 focus:outline-none 
      dark:border-blue-600 dark:hover:border-blue-700 
      dark:focus:ring-blue-800
    ">
    <CheckBadgeIcon class="h-5 w-5 text-gray-400 dark:text-gray-600" />
  </button>
</template>
<script setup lang="ts">
  import { CheckBadgeIcon, } from '@heroicons/vue/24/solid'
  import { defineProps, defineEmits } from 'vue';
  defineEmits([`wordSelected`,]);
  const props = defineProps({  
    idx: {type: Number, required: false,},
  })
</script>