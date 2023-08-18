<template>
  <div class="examples-page">
    <div class="mx-auto">
      <StandaloneTrExampleFilterPanel />
    </div>
    <div class="max-w-5xl mx-auto pt-2 pb-3">
      <TrExampleDatatable />
    </div>
  </div>
    
    
</template>
  
<script setup lang="ts">
import TrExampleDatatable from '@/components/datatable/TrExampleDatatable.vue';
import StandaloneTrExampleFilterPanel from '@/components/datatable/filter-panel/StandaloneTrExampleFilterPanel.vue';

</script>

<style lang="scss">

</style>