<template>
  <div class="">
    <button 
      :id="props.id"
      class="
        m-1 mr-2 mb-1 px-5 py-2.5 font-medium rounded-full text-sm text-center 
        focus:outline-none focus:ring-4 focus:ring-orange-300 
        dark:focus:ring-orange-800
      "
      :class="{
        [`
          text-gray-500
          bg-orange-400 
          dark:bg-orange-800 
          cursor-not-allowed
        `]: isDisabled,
        [`
          text-gray-100
          bg-orange-500 
          hover:bg-orange-600 
          dark:bg-orange-600 
          dark:hover:bg-orange-700 
        `]: !isDisabled,
      }"
      @click="$emit(`click`)"
    >{{props.text}}</button>
  </div>
</template>
<script lang="ts" setup>
  defineEmits(['click']);
  
  const props = defineProps({  
    id: {type: String, required: true,},
    text: { type: String, required: true, },
    isDisabled: {type: Boolean, required: false,},
  });
</script>