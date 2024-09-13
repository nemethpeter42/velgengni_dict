<template>
  <div 
    class="
      font-normal pb-2
    ">HTML export
  </div>
  <div
    class="main-content">
    <div 
      v-for="(groupContent, groupName) of savedDictQueryStore.entries"
      :key="groupName">
      <div class="font-bold py-2">{{ groupName }}</div>
      <div
        class="flex flex-wrap items-baseline m-1.5"
        v-for="(item, index) of groupContent"
        :key="index">
        <!--TODO no store no ref just get them by id--->
        <input 
          :data-group="groupName"
          :data-index="index"
          class="
            export-title-for-saved-query
            w-24 px-2 py-1.5 m-0.5 
            shadow-sm border block text-sm rounded-lg
            bg-gray-50 text-gray-900 border-gray-300 
            focus:ring-blue-500 focus:border-blue-500  
            dark:shadow-sm-light dark:placeholder-gray-400 
            dark:bg-gray-600 dark:text-white dark:border-gray-300 
            dark:focus:ring-blue-500 dark:focus:border-blue-500
          " 
          placeholder="">
        <div class="p-2 text-sm">
          {{ item.title }}
        </div>
      </div>
    </div>
    <div class="pt-5 pb-1">
      <WordListPrevNextButton 
        id="newSavedQuerySubmitBtn"
        text="Exportálás"
        :isDisabled="isDisabled"
        @click="() => {
          if(!isDisabled) {
            sendExportRequest()
          }
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import WordListPrevNextButton from '../input-fields-and-buttons/WordListPrevNextButton.vue';
import { useSavedDictQueryStore } from '@/stores/savedDictQuery';
import { useNotiStore } from '@/stores/noti';
import { obtainDictQueryResult, useDictStore } from '@/stores/dict';
import type { ExportModuleRequest } from '../../../../libs/szotar_common/src/models/ExportModuleRequest';
import { downloadBlob, exportToHtmlFormat } from '@/helpers/download';

  const savedDictQueryStore = useSavedDictQueryStore()

  const notiStore = useNotiStore()
  const dictStore = useDictStore(`dictModule`)

  const isDisabled = computed(() => false)

  const sendExportRequest = async() => {
    const fieldsRaw = [...document.querySelectorAll(`.export-title-for-saved-query`)].
      map(eRaw=>{
        const e = eRaw as HTMLInputElement;
        return {
          exportTitle: e?.value ?? ``, 
          group: e.attributes?.getNamedItem("data-group")?.value ?? ``, 
          idx: +(e.attributes?.getNamedItem("data-index")?.value ?? NaN)}
    });
    const fields = fieldsRaw.filter(e=>e.exportTitle.trim() !== ``);
    if (fields.length === 0) {
      notiStore.notifications.push({
        type: `error`,
        msg: `Legalább egy mezőt ki kell tölteni!`
      })
      return;
    }
    if (fields.some(e=>RegExp(`.*[^a-zA-Z0-9_\-].*`,`i`).test(e.exportTitle))) {
      notiStore.notifications.push({
        type: `error`,
        msg: `Az export névnél megengedett karakterek: angol kis- ill. nagybetűk, számok, kötőjel, aláhúzás.`
      })
      return;
    }
    try {
      const exportData: ExportModuleRequest = {data:{}, pageSize: 80, percentageWhenOriginalIsAsked: 70};
      for (const field of fields) {
        const savedQuery = savedDictQueryStore.entries[field.group]?.at(field.idx)
        if (isNaN(field.idx) || !savedQuery) {
          throw new Error(`Error while retrieving saved queries.`)
        }
        const queryResult = 
          await obtainDictQueryResult(
            savedQuery.dictName, 
            savedQuery.searchQuery, 
            savedQuery.sortComparison
          );
        const currDictMetadata = dictStore.dictQueriesWithMeta[savedQuery.dictName]?.meta;
        const originalColName: string = currDictMetadata?.originalCol ?? ``;
        const translatedColName: string = dictStore.meaningForestColsInPrioOrder[savedQuery.dictName]?.at(0) ?? ``
        if (!originalColName) {
          throw new Error(
            `No source language column found for dictionary "${savedQuery.dictName}" (default name: original)`
          );
        }
        if (!translatedColName) {
          throw new Error(
            `No target language column found for dictionary "${savedQuery.dictName}" (meaning-forest structure, default name: translated)`
          );
        }

        const exportDataForQueryResult = queryResult.map(e => ({
          originalCol: e[originalColName] ?? ``,
          translatedCol: e[translatedColName] ?? ``,
        }));

        exportData.data[field.exportTitle] = exportDataForQueryResult;
      }

      const zipAsBlob = await exportToHtmlFormat(exportData);
      const dt = new Date();
      const pad = (num: number): string => num < 10 ? `0${num}`: `${num}` 
      const fn = `export_res_${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}${pad(dt.getHours())}${pad(dt.getMinutes())}.zip`
      console.log(fn)
      downloadBlob(zipAsBlob, fn)

    } catch (error: unknown) {
      console.error(error)
      notiStore.notifications.push({
        type: `error`,
        msg: `Error in export flow. See console for details.`
      })
      return;
    }

  }
</script>