<template>
  <div class="knowledge-view">
    <KnowledgeTempMenu />
  </div>
  <div class="flex overflow-hidden">
    <KnowledgeColumn />
    <KnowledgeColumn />
    <KnowledgeColumn />
  </div>
</template>

<script setup lang="ts">
import KnowledgeColumn from '@/components/knowledge-test/KnowledgeColumn.vue';
import KnowledgeTempMenu from '@/components/knowledge-test/KnowledgeTempMenu.vue';


</script>

<style scoped>

</style>