<template>
  <div class="max-w-7xl m-auto home-page">
    <DictFilterPanel />
    <DictDatatable />
  </div>
  
  
</template>

<script setup lang="ts">

import DictFilterPanel from '@/components/datatable/filter-panel/DictFilterPanel.vue';
import DictDatatable from '@/components/datatable/DictDatatable.vue';

</script>

<style lang="scss">

</style>