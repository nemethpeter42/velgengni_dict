<template>
    <div v-if="displayColsAsRawString">
        {{ rawVal }}
    </div>
    <div v-else-if="parseResult.isValid">
        <ul class="list-disc lvl1-item">
            <li class="mb-1.5" v-for="(lvl1, lvl1Index) in parseResult.val.val" v-bind:key="lvl1Index">
                <ul 
                    v-if="
                        lvl1.nextLevel && (
                            lvl1.nextLevel.some( 
                                lvl2 => 
                                    lvl2.labels?.length > 0 ||
                                    lvl2.notes?.length > 0 ||
                                    lvl2.nextLevel && lvl2.nextLevel.some(
                                        lvl3 =>
                                            lvl3.labels?.length > 0 ||
                                            lvl3.notes?.length > 0 ||
                                            lvl3.val?.trim() !==``
                                    )
                            )
                        )
                    ">
                    <li 
                        v-for="(lvl2, lvl2Index) in (lvl1.nextLevel ?? [])" 
                        v-bind:key="lvl2Index"
                        class=""
                    >
                        <span 
                            v-if=" 
                                lvl2.nextLevel && lvl2.nextLevel.some(
                                    lvl3 =>
                                        lvl3.labels?.length > 0 ||
                                        lvl3.notes?.length > 0 ||
                                        lvl3.val?.trim() !==``
                                    )
                                ">
                            <span v-for="(lvl3, lvl3Index) in (lvl2.nextLevel ?? [])" v-bind:key="lvl3Index">
                                <span>
                                    <strong v-if="lvl1.labels?.includes(`1`) || lvl2.labels?.includes(`1`) || lvl3.labels?.includes(`1`)">
                                        {{lvl3.val}}
                                    </strong>
                                    <span v-else>{{lvl3.val}}</span>
                                </span>
                                <span v-if="lvl3.labels?.filter(e=>e!==`1`).length > 0 || lvl3.notes?.length > 0">
                                    <em>&nbsp;({{ 
                                    (lvl3.labels ?? []).
                                        filter(label=>label!==`1`).
                                        concat(lvl3.notes ?? []).
                                        join(`; `) 
                                    }})</em>
                                </span>
                                <span v-if="lvl3Index + 1 < lvl2.nextLevel?.length">&#32;/&#32;</span>
                            </span>
                        </span>
                        <span 
                            v-for="(lvl2LabelOrNote, lvl2LabelOrNoteIndex) in (lvl2.labels ?? []).filter(label=>label!=='1').concat(lvl2.notes ?? [])"  
                            v-bind:key="lvl2LabelOrNoteIndex">
                            <br><em>
                                {{ lvl2LabelOrNote }}
                            </em>
                        </span>
                        
                    </li>
                </ul>
                <ul
                    v-if="lvl1.labels?.filter(e=>e!==`1`).length > 0 || lvl1.notes?.length > 0"
                >
                    <li 
                        v-for="(lvl1LabelOrNote, lvl1LabelOrNoteIndex) in (lvl1.labels ?? []).filter(label=>label!=='1').concat(lvl1.notes ?? [])"  
                        v-bind:key="lvl1LabelOrNoteIndex"
                        >
                            <em>{{ lvl1LabelOrNote }}</em>
                        </li>
                </ul>
            </li>
        </ul>
    </div>
    <div v-else class="text-red-500 text-bold">
        PARSE ERROR
    </div>
</template>

<script setup lang="ts">

  import { useDictStore } from '@/stores/dict';
  import { computed,defineProps, } from 'vue';
  import { MeaningForest } from '../../../../libs/szotar_common/src/models/MeaningForest.js';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const store = useDictStore();
  const props = defineProps({
    displayColsAsRawString: { type: Boolean, required: true },  // somehow if i ask for this directly here from the store, it causes a huge slowdown (maybe ref-unwrapping?)
    rawVal: { type: String, required: true },
  });
  const parseResult = computed(() => {
    try {
      const val: MeaningForest = MeaningForest.fromString(props.rawVal);
        //console.log(val)
        return {val, isValid: true,};
      } catch (e) {
        console.error(e);
        return {val: MeaningForest.fromString(``), isValid: false,};
      }
    });
</script>
<style>
  .lvl1-item li ul {
    padding-left: 1.0rem;
    text-indent: -1.0rem;
    line-height: 1.15rem;
  }
  .lvl1-item li ul li:before{
    display: block;
    float: left;
    width: 1.0rem;
  }
  .lvl1-item li:nth-child(even) ul li:before{
    content: "¤";
  }
  .lvl1-item li:nth-child(odd) ul li:before {
    content: "#";
  }
</style>