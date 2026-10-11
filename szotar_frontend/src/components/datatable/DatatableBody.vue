<template>
  <tbody>
    <template
      v-for="(item, idxOnCurrPage) in (props.onePageOfEntries as FilteredEntry[])" 
      v-bind:key="item.idx"
    >
    <tr 
      :class="{
        [`
          bg-gray-100 
          hover:bg-gray-300
          dark:bg-gray-800 dark:border-gray-600 
          dark:hover:bg-gray-600
        `]: idxOnCurrPage % 2 === 0,
        [`
          bg-gray-200
          hover:bg-gray-300
          dark:bg-gray-700 dark:border-gray-700 
          dark:hover:bg-gray-600
        `]: idxOnCurrPage % 2 !== 0,
        }"
        :data-row-index="idxOnCurrPage"
      >
      <td class="w-4 pl-4 pr-2 py-1.5">
        <div class="flex items-center">
          <input type="checkbox"
            v-if="!props.disableRowSelectionCheckbox"
            @click="$emit(`toggleRowSelection`,item.idx,$event)"
            :checked="props.selectedIndices.has(item.idx)"
            class="
              select-row-checkbox w-4 h-4 rounded 
              focus:ring-fuchsia-500 focus:ring-2 
              dark:ring-offset-gray-700
              dark:focus:ring-fuchsia-600 dark:focus:ring-offset-gray-700
            "
            :class="{
              [`
                text-fuchsia-600 bg-gray-200 border-gray-400
                dark:bg-gray-600 dark:border-gray-500
              `]: !props.highlightedIndices.has(item.idx),
              [`
                text-green-600 bg-green-200 border-orange-400
                dark:bg-green-600 dark:border-orange-500
              `]: props.highlightedIndices.has(item.idx),
              [`
                appearance-none
              `]: props.highlightedIndices.has(item.idx) && !props.selectedIndices.has(item.idx),
              [`
                appearance-none
                border-4
              `]: props.highlightedIndices.has(item.idx) && props.selectedIndices.has(item.idx)
            }">
            <slot name="rowLevelButtons" :idx="item.idx" :sortedIdx="item.sortedIdx" :idxOnCurrPage="idxOnCurrPage"></slot>
          <label for="select-row-checkbox" class="sr-only">{{ $t('datatable.selectRow') }}</label>
        </div>
      </td>
      <td 
        scope="row" 
        class="px-2.5 py-1.5 font-medium text-gray-900 dark:text-gray-200" 
        v-for="col of props.columnDefinitions" 
        v-bind:key="col.colName" 
        :class="col.colDef?.tailwindClasses ?? ``"
        >
        <MeaningForestViewer 
          v-if="col.colDef.isMeaningForestCol" 
          :raw-val="item.val[col.colName]" 
          :displayColsAsRawString="props.displayColsAsRawString" 
          />
        <div v-else-if="col.colDef.isTrExamplePairCol && !props.displayColsAsRawString" >
          <div>
            <strong
              v-html="highlightTrExamples(item.val[col.colName]?.split(`\t`)?.at(0) ?? ``)"
            ></strong>
          </div>
          <div
            v-html="highlightTrExamples(item.val[col.colName]?.split(`\t`)?.at(1) ?? ``)"
          >
          </div>
        </div>
        <div v-else>{{item.val[col.colName]}}</div>
      </td>
      <td class="
        px-6 py-2 max-w-40 font-medium 
        text-gray-800 
        dark:text-gray-200
      ">
        <!--ghost column-->
        
      </td>
    </tr>
    
    <slot 
      name="detailRow" 
      :idx="item.idx" 
      :sortedIdx="item.sortedIdx" 
      :idxOnCurrPage="idxOnCurrPage" 
      :preferredColspan="props.columnDefinitions.length + 2">
    </slot>
    </template>
  </tbody>
</template>

<script lang="ts" setup>
  import {getPatternForSearchCondition} from 'szotar_common/helpers/getPatternForSearchCondition.js'
  import MeaningForestViewer from '@/components/meaning-forest/MeaningForestViewer.vue';
  import * as sanitizeHtml from 'sanitize-html';

  import type { FilteredEntry } from '@/frontend_models/FilteredEntry';
  import type { HighlightDefinition } from '@/frontend_models/HighlightDefinition';
import { type ComputedRef, computed } from 'vue';
import type { ColumnDefinitionArrayForm } from '@/frontend_models/ColumnDefinitionArrayForm';

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

  const encloseIntoTagsInHtml = (html: string, textToEnclose: string, tagOpen: string, tagClose: string) => {
       
    const pattern = getPatternForSearchCondition({expression:textToEnclose, onlyWithSpaceDotOrCommaSuffix: false, onlyWithSpacePrefix: false})
    const regex = new RegExp(pattern, 'gi');
    const matches = [...html.matchAll(regex)].map(m => ({start: m.index, end: m.index + m[0].length - 1})).reverse()
    
    for (const match of matches) {
      const tagAreas = getHtmlTagAreas(html)
      if ( !tagAreas.some(pair => pair.start<=match.start && match.end <= pair.end)) {
          html = html.substring(0, match.start) + tagOpen + html.substring(match.start, match.end + 1) + tagClose + html.substring(match.end + 1)
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
    
  const props = defineProps<{  
    selectedIndices: Set<number>,
    highlightedIndices: Set<number>,
    onePageOfEntries: FilteredEntry[],
    columnDefinitions: ColumnDefinitionArrayForm[],
    displayColsAsRawString?: boolean,
    disableRowSelectionCheckbox?: boolean,
    highlightedTexts?: HighlightDefinition[],
  }>();


</script>