
<template>
  <!---
    TODO Change i18n to "Search in target language" 
    and "Search in source language" respectively
  --->
  <button 
    id="exampleSearchButton"
    :title="$t('trExample.searchInTargetLanguage')"
    class="
      m-1 mr-2 mb-2 px-5 py-2.5 font-medium rounded-full text-sm text-center 
      text-white bg-blue-700 
      hover:bg-blue-800 
      focus:outline-none focus:ring-4 focus:ring-blue-300 
      dark:bg-blue-600 
      dark:hover:bg-blue-700 
      dark:focus:ring-blue-800
    "
    >
    {{ $t('trExample.searchInTargetLanguage') }}
  </button>
</template>

<script lang="ts" setup>

</script>