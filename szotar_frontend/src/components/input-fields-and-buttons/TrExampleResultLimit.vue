<template>
  <div class="text-sm font-normal text-gray-500 dark:text-gray-400"> 
    Találati limit: <span
      class="font-semibold text-gray-900 dark:text-white">
      <select 
        id="resultLimit" 
        class="
          w-30 p-2 text-sm border rounded-lg 
          text-gray-900 border-gray-300 bg-gray-50 
          focus:ring-blue-500 focus:border-blue-500 
          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
          dark:focus:ring-blue-500 dark:focus:border-blue-500
        "
      >
        <option 
          v-for="val in props.options" 
          v-bind:key="val" 
          :selected="currentlySelected===val" 
          @click="$emit(`input`, val);"
          >{{val}}</option>
      </select>
    </span>
  </div>
</template>
<script lang="ts" setup>
  defineEmits([`input`]);
  const props = defineProps<{
    options: number[],
    currentlySelected?: number,
  }>();
</script>