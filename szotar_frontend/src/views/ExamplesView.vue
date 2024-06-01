<template>
  <div class="examples-page">
    <div class="mx-auto">
      <StandaloneTrExampleFilterPanel storeId="standalone" />
    </div>
    <div class="max-w-5xl mx-auto pt-2 pb-3">
      <TrExampleDatatable storeId="standalone" />
    </div>
  </div>
    
    
</template>
  
<script lang="ts" setup>
import TrExampleDatatable from '@/components/datatable/TrExampleDatatable.vue';
import StandaloneTrExampleFilterPanel from '@/components/datatable/filter-panel/StandaloneTrExampleFilterPanel.vue';
import { type TrExampleStoreType } from '@/frontend_models/TrExampleStoreTypes';

</script>

<style lang="scss">

</style>