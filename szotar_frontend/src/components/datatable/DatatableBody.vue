<template>
  <tbody>
    <tr
      v-for="(item, rowIndex) in (props.onePageOfEntries as FilteredEntry[])" 
      v-bind:key="item.idx" 
      class="
        border-b
        
      "
      :class="{
        [`
          bg-gray-100 
          hover:bg-gray-300
          dark:bg-gray-800 dark:border-gray-600 
          dark:hover:bg-gray-600
        `]: rowIndex % 2 === 0,
        [`
          bg-gray-200
          hover:bg-gray-300
          dark:bg-gray-700 dark:border-gray-700 
          dark:hover:bg-gray-600
        `]: rowIndex % 2 !== 0,
        }"
      >
      <td class="w-4 pl-4 pr-2 py-1.5">
        <div class="flex items-center">
          <input type="checkbox"
            v-if="!props.disableRowSelectionCheckbox"
            @click="$emit(`toggleRowSelection`,item.idx,$event)"
            :checked="props.selectedIndices.has(item.idx)"
            class="
              select-row-checkbox w-4 h-4 rounded 
              text-fuchsia-600 bg-gray-200 border-gray-400 
              focus:ring-fuchsia-500 focus:ring-2 
              dark:ring-offset-gray-700 dark:bg-gray-600 dark:border-gray-500
              dark:focus:ring-fuchsia-600 dark:focus:ring-offset-gray-700
            ">
            <slot name="rowLevelButtons" :idx="item.idx"></slot>
          <label for="select-row-checkbox" class="sr-only">Sor kiválasztása</label>
        </div>
      </td>
      <td 
        scope="row" 
        class="px-2.5 py-1.5 font-medium text-gray-900 dark:text-gray-200" 
        v-for="(colDef,colName) of (props.columnDefinitions as Record<string, ColumnDefinition>)" 
        v-bind:key="colName" 
        :class="colDef?.tailwindClasses ?? ``"
        >
        <MeaningForestViewer 
          v-if="colDef.isMeaningForestCol" 
          :raw-val="item.val.translated" 
          :displayColsAsRawString="props.displayColsAsRawString" 
          />
        <div v-else-if="colDef.isTrExamplePairCol && !props.displayColsAsRawString" >
          <div>
            <strong
              v-html="highlightTrExamples(item.val[colName]?.split(`\t`)?.at(0) ?? ``)"
            ></strong>
          </div>
          <div
            v-html="highlightTrExamples(item.val[colName]?.split(`\t`)?.at(1) ?? ``)"
          >
          </div>
        </div>
        <div v-else>{{item.val[colName]}}</div>
      </td>
      <td class="
        px-6 py-2 max-w-40 font-medium 
        text-gray-800 
        dark:text-gray-200
      ">
        <!--ghost column-->
        
      </td>
    </tr>
  </tbody>
</template>

<script setup lang="ts">
  
  import MeaningForestViewer from '@/components/meaning-forest/MeaningForestViewer.vue';
  import { ColumnDefinition } from '../../../../libs/szotar_common/src/models/ColumnDefinition';
  import * as sanitizeHtml from 'sanitize-html';

  import { defineProps, defineEmits } from 'vue';
  import { FilteredEntry } from '@/frontend_models/FilteredEntry';
import { HighlightDefinition } from '@/frontend_models/HighlightDefinition';

  type PositionPair = {start: number, end: number}

  const getHtmlTagAreas = (str: string): PositionPair[] => {
    const res = []
    let pos = 0
    let currStart = -1
    while (pos < str.length){
      if (currStart===-1 && str[pos]===`<`) {
        currStart = pos
      } else if (currStart!==-1 && str[pos]===`>`) {
        res.push({start: currStart, end: pos,});
        currStart=-1;
      }
      pos++;
    }
    return res
  }

  const encloseIntoTagsInHtml = (html: string, from: string, tagOpen: string, tagClose: string) => {
    //html = html.split(`<`).join(`&lt;`)
    //html = html.split(`>`).join(`&gt;`)
    const tagAreas = getHtmlTagAreas(html)
    for (let i = html.length-1; i>=0; i--) {
      if (html.substring(i, i + from.length).toLowerCase() === from.toLowerCase() && !tagAreas.some(pair => pair.start<=i && i<=pair.end)) {
        html = html.substring(0, i) + tagOpen + html.substring(i, i + from.length) + tagClose + html.substring(i + from.length)
      }
    }
    return html
  }

  const highlightTrExamples = (dirtyHtml: string): string => {
    dirtyHtml = dirtyHtml.split(`<`).join(`&lt;`)
    dirtyHtml = dirtyHtml.split(`>`).join(`&gt;`)
    const highlightedTextsDescendingLengthOrder = [
      ...props.highlightedTexts ?? []
    ].sort((a,b) => a.val.length > b.val.length ? -1 : 1)
    for(const highlightedText of highlightedTextsDescendingLengthOrder) {
      dirtyHtml = encloseIntoTagsInHtml(
        dirtyHtml,
        highlightedText.val,
        `<span style="${highlightedText.style}">`,
        `</span>`)
    }
    const cleanHtml = sanitizeHtml.default(dirtyHtml, {
      allowedTags: [ `b`, `i`, `em`, `strong`, `span` ],
      allowedAttributes: {
        'span': [`style`],
      },
    });
    return cleanHtml
  }


  defineEmits(['toggleRowSelection']);
    
  const props = defineProps({  
    selectedIndices: {type: Set, required: true,},
    onePageOfEntries: { type: Array, required: true, },
    columnDefinitions: { type: Object, required: true, },
    displayColsAsRawString: {type: Boolean, required: false,},
    disableRowSelectionCheckbox: {type: Boolean, required: false,},
    highlightedTexts: {type: Array<HighlightDefinition>, required: false,},
  });
</script>