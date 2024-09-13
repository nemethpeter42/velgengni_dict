

import {downloadZip} from 'client-zip';
import { type ExportedEntry, type ExportModuleRequest } from '../../../libs/szotar_common/src/models/ExportModuleRequest';
import { MeaningForest } from '../../../libs/szotar_common/src/models/MeaningForest';


//source: https://blog.logrocket.com/programmatically-downloading-files-browser/
export const downloadBlob = (blob: Blob, filename: string) => {
  // Create an object URL for the blob object
  const url = URL.createObjectURL(blob);

  // Create a new anchor element
  const a = document.createElement('a');

  // Set the href and download attributes for the anchor element
  // You can optionally set other attributes like `title`, etc
  // Especially, if the anchor element will be attached to the DOM
  a.href = url;
  a.download = filename || 'download';

  // Click handler that releases the object URL after the element has been clicked
  // This is required for one-off downloads of the blob content
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      removeEventListener('click', clickHandler);
    }, 150);
  };

  // Add the click event listener on the anchor element
  // Comment out this line if you don't want a one-off download of the blob content
  a.addEventListener('click', clickHandler, false);

  // Programmatically trigger a click on the anchor element
  // Useful if you want the download to happen automatically
  // Without attaching the anchor element to the DOM
  // Comment out this line if you don't want an automatic download of the blob content
  a.click();

  // Return the anchor element
  // Useful if you want a reference to the element
  // in order to attach it to the DOM or use it in some other way
  return a;
}

/*

const pagesOfFilteredEntries = computed(()=> {
  const chunkSize = resultsPerPage.value;
  return filteredEntries.value.reduce((acc, _, i) => {
    if (i % chunkSize === 0) acc.push(filteredEntries.value.slice(i, i + chunkSize))
    return acc
  }, [] as FilteredEntry[][])
});


const getNameForDoubleChunk = (nr) => `` + Math.trunc(nr/10) + letters[nr % 10 / 2]
for (const [chunkIdx, chunk] of doubleChunksOfEntries.entries()) {
	
	
	createHtml(`${outPrefix}${String(getNameForDoubleChunk(chunkIdx*2)).padStart(3, '0')}.html`, chunk, getNameForDoubleChunk(chunkIdx*2), createHtmlForChunkEntriesFuncBody)
}

*/

const renderMeaningsInHtml = (m: MeaningForest) => {
  const tab = '\t'
  const newLine = '\n'
  const oddLvl2ListSymbol = "¤"
  const evenLvl2ListSymbol = "#"
  //console.log(m)
  let lvl1Results = []
  const isPrimary = (lvl1Idx: number, lvl2Idx: number, lvl3Idx: number) =>
    m.val[lvl1Idx].labels.includes("1") || 
    m.val[lvl1Idx].nextLevel[lvl2Idx].labels.includes("1") ||
    m.val[lvl1Idx].nextLevel[lvl2Idx].nextLevel[lvl3Idx].labels.includes("1")
  for (const [lvl1Idx, lvl1] of m.val.entries()) {
    //console.log(lvl1)
    let lvl2Results = []
    for (const [lvl2Idx, lvl2] of lvl1.nextLevel.entries()) {
      let lvl3Results = []
      for (const [lvl3Idx, lvl3] of lvl2.nextLevel.entries()) {
        const lvl3LabelsAndNotes = (lvl3.labels ?? []).filter(label=>label!=="1").concat(lvl3.notes ?? [])
        //console.log(lvl3LabelsAndNotes)
        //console.log(lvl3.val)
        const lvl3Res = 
          (isPrimary(lvl1Idx, lvl2Idx, lvl3Idx) ? "<b>": "" )+
          lvl3.val+
          (isPrimary(lvl1Idx, lvl2Idx, lvl3Idx) ? "</b>": "" )+
          (lvl3LabelsAndNotes.length > 0 ? " (<i>"+lvl3LabelsAndNotes.join(";")+"</i>)": "")
        if (lvl3Res.trim()!=="") {
          lvl3Results.push(lvl3Res)
        }
      }
      let lvl2Result = lvl3Results.join(" / ")
      const lvl2LabelsAndNotes = (lvl2.labels ?? []).filter(label=>label!=="1").concat(lvl2.notes ?? [])
      for (const lvl2LabelOrNote of lvl2LabelsAndNotes) {
        lvl2Result+="<br>"+newLine+tab+tab+"&nbsp;&nbsp;&nbsp;<i>"+lvl2LabelOrNote+"</i>"
      }
      if (lvl2Result.trim()!==""){
        lvl2Results.push(lvl2Result)
      }
    }
    const lvl1LabelsAndNotes = (lvl1.labels ?? []).filter(label=>label!=="1").concat(lvl1.notes ?? [])
    const lvl2ListSym = lvl1Idx % 2 === 0 ? oddLvl2ListSymbol : evenLvl2ListSymbol
    let lvl1Result = ""
    //console.log(lvl2Results)
    //console.log(lvl1LabelsAndNotes)
    if (lvl2Results.length>0) {
      lvl1Result += tab+tab+lvl2ListSym+" "+lvl2Results.join("<br>"+newLine+tab+tab+lvl2ListSym+" ")
    }
    if (lvl1LabelsAndNotes.length>0){
      if (lvl1Result.trim()!=="") {lvl1Result += "<br>"+newLine}
      lvl1Result += tab+tab+lvl1LabelsAndNotes.map(e=>lvl2ListSym+" <i>"+e+"</i>").join("<br>"+newLine+tab+tab)
    }
    lvl1Results.push(lvl1Result)
  }
  return "<ul>"+newLine+lvl1Results.map(e=>tab+"<li>"+newLine+e+newLine+tab+"</li>"+newLine).join("")+"</ul>"
}

const renderEntriesForNormalView = (entries: ExportedEntry[]): string => {
  let result = ''
	for (const entry of entries) {
		result += '<div class="original-word">'
		result += entry.originalCol
		result += "</div>"
		result += '<div class="translation">'
		result += renderMeaningsInHtml(MeaningForest.fromString(entry.translatedCol))
		result += "</div>"
		result += '<div class="entry-separator">=====</div>'
	}
	return result
}
const renderHtml = (entries: ExportedEntry[], percentageWhenOriginalIsAsked : number ): string => {
	let result = ``
	result += `
<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8'>
<meta name=viewport content="width=device-width, initial-scale=1">
<style>
  button {
    padding: 5px;
    font-size: 14px;
    margin: 2px 0px;
  }

  ul > li {
    margin-bottom: 6px;
  }

  ul > li:nth-child(odd) {
    list-style-type: disc;
  }

  ul > li:nth-child(even) {
    list-style-type: disc;
  }

  ul {
    margin-top: 10px;
    margin-bottom: 10px;
    padding-left: 22px;
  }

  body {
    font-size: 14px;
  }

  .original-word {
    font-size: 18px;
    font-weight: bold;
    margin: 6px 4px;
  }

  .hidden {
    display: none;
  }
</style>
</head>
<script>
const getPageSize = () => document.querySelectorAll(".non-test-rendering-area .original-word").length;
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const percentageWhenOriginalIsAsked = ${percentageWhenOriginalIsAsked};

const getRandomOrderedIndices = () => shuffleArray([...Array(getPageSize()).keys()]); 

const getOriginalIsAskedInTestMode = () => {
	const res = shuffleArray([...Array(getPageSize()).keys()]);
	return new Set(
		res.slice(
			Math.floor(
				(1-percentageWhenOriginalIsAsked / 100)*res.length
			)
		)
	);
};

const getOrig = () => [...document.querySelectorAll(".non-test-rendering-area .original-word")].map(e=>e.innerHTML);

const getTransl = () => [...document.querySelectorAll(".non-test-rendering-area .translation")].map(e=>e.innerHTML);
		
const renderTestModeHtml = () => {
	const pageSize = getPageSize();
	const randomOrderedIndices = getRandomOrderedIndices();
	const originalIsAskedInTestMode = getOriginalIsAskedInTestMode()
	const orig = getOrig() 
	const transl = getTransl() 
	let result = ''
	for (const idx of randomOrderedIndices) {
		result += '<div><button onclick=\\\'[...document.querySelectorAll(".orig-'+idx+'"), ...document.querySelectorAll(".transl-'+idx+'")].forEach(function(e){e.classList.remove("hidden")})\\\'>Megoldás</button></div>'
		
		result += '<div class="original-word orig-'+idx+" "+(originalIsAskedInTestMode.has(idx) ? 'hidden':'')+'">'
		result += orig[idx]
		result += "</div>"
		result += '<div class="translation transl-'+idx+" "+(!originalIsAskedInTestMode.has(idx) ? 'hidden':'')+'">'
		result += transl[idx]
		result += "</div>"
		result += '<div class="entry-separator">=====</div>'
	}
	return result
}

let testMode = false;

function toggleTestMode (){
	testMode = !testMode
	const nonTestRenderingArea = document.querySelectorAll(".non-test-rendering-area")[0]
	const testRenderingArea = document.querySelectorAll(".test-rendering-area")[0]
	if (testMode) {
		testRenderingArea.innerHTML = renderTestModeHtml()
		testRenderingArea.classList.remove("hidden")
		nonTestRenderingArea.classList.add("hidden")
	} else {
		testRenderingArea.classList.add("hidden")
		nonTestRenderingArea.classList.remove("hidden")
	}
}

const chunk = JSON.parse(${'\u0060'+JSON.stringify(entries, null, 2).replaceAll("\u0060",":backTick:").replaceAll("\\","\\\\")+'\u0060.replaceAll(":backTick:","\u0060")'})

</script>
<body>
<div>
<button onclick="toggleTestMode()">Teszt mód kapcsoló</button><br>
=====
</div>
<div class="test-rendering-area">
</div>
<div class="non-test-rendering-area">
`
result+=renderEntriesForNormalView(entries)
result+=`
</div>
</body>
</html>
`
  return result;
}



export const exportToHtmlFormat = async (exportData: ExportModuleRequest): Promise<Blob> => {
  const letters = [`a`,`b`,`c`,`d`,`e`];
  const getNameForIndex = (idx: number) => `${Math.trunc(idx / 5)}${letters[idx % 5]}`.padStart(3,`0`);
  const fileDefs: {
    name: string;
    lastModified: Date;
    input: string;
  }[] = []

  for (const [exportTitle, entriesForExportTitle] of Object.entries(exportData.data)) {
    const chunks = entriesForExportTitle.reduce((acc, _, i) => {
      if (i % exportData.pageSize === 0) acc.push(entriesForExportTitle.slice(i, i + exportData.pageSize))
      return acc
    }, [] as ExportedEntry[][])
    for (const [chunkIndex, chunk] of chunks.entries()) {
      fileDefs.push({ 
        name: `${exportTitle}/${exportTitle}_${getNameForIndex(chunkIndex)}.html`, 
        lastModified: new Date(), 
        input: renderHtml(chunk, exportData.percentageWhenOriginalIsAsked), 
      })
    }
    
  }
  
  const blob = await downloadZip(fileDefs,{buffersAreUTF8: true,}).blob()
  return blob;
}

