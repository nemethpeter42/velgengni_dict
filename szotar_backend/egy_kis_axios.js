import axios from 'axios';
let asyncRequest = async () =>{
	try{
		let a = await axios.post('http://127.0.0.1:3035/find', {
			conditions: [
				{
					//TODO val: without whitespace
					expression:'werde', 
					// tabulatornak nem kellene benne lennie, 
					// kettospont, pontosvesszo nagyon ritka, nem erdemes vele foglalkozni
					onlyWithSpacePrefix:true,
					onlyWithSpaceDotOrCommaSuffix:true,
				},
			],
		  lang1: 'de',
		  lang2: 'hu',
		  searchInSecondParamLanguage: false,
		  resultLimit: 20
		});
		console.log(a.data.entries)
	} catch(err) {
		console.log(err)
	}
}
let res = await asyncRequest()