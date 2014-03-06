//Yodafy
//by Anthony Ladson, Miguel Perez, and Michael Fox

//Prefix Notation:
//pos == Part Of Speech obj
//y == yoda grammar
//e == standard english grammar

/////////////////////////////
//----Utilities
/////////////////////////////
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function addElement(map, key, value)
{
  map[key] = value;
  return map;
}

function strongSplit(str){
	var output = [];  
	var	s = str.split(" ");
	
	for(var i=0; i<s.length; i++){
		var word = s[i];
		
		if(word.charAt(word.length-1) == "," || word.charAt(word.length-1) == "." || word.charAt(word.length-1) == "!"){
			output.push(word.slice(0,word.length-1));
			output.push(word.slice(length-1,word.length));
		} else {
			output.push(word);
		}
	}
	
	return output;
}

function array2object(a)
{
	var o ={};
	for(var i=0;i<a.length;i++)
	{
		o[a[i].type] = "";
	}
	
	return o;
}


////////////////////////////////////
//---Request Yoda and English Utterances
////////////////////////////////////
function StringData(arrayType){
	
	var array,
		req = new XMLHttpRequest();
		
	req.onload = function(){
			var html = this.responseText;
			console.log(arrayType);
			YosonObject = JSON.parse(html);
			array = YosonObject[arrayType + "Array"];
			//determine which POS follow which POS
			//constructSentenceGrammar();
	}
	req.open("GET","yoson.json",true);
	req.send();

	this.array = function(){
		return array;
	}

}

var yUtterances = new StringData("yoda");	
var eUtterances = new StringData("english");

//////////////////////////////////////
//---Build posUtterances
//////////////////////////////////////
function PosWord(sentWord, sentType){
	this.word = sentWord;
	this.type = sentType;
}

function PosSentence(theInput){
	var words = new Lexer().lex(theInput);
	var taggedWords = new POSTagger().tag(words);
	
	this.specialSentence = [];
		   
	for (i in taggedWords) {
		var taggedWord = taggedWords[i];
		var word = taggedWord[0];
		var tag = taggedWord[1].charAt(0);; 

		this.specialSentence.push(new PosWord(word, tag));
	}
}

function buildPOS(sentenceArray,posArray){
	
	for(var i = 0; i<sentenceArray.length; i++)
	{
		var sentence = sentenceArray[i];
		posArray.push(new PosSentence(sentence)); 
	}	
	
	return true;
}

var ePosUtterances = [];
var reorderedPosUtterances = [];

///////////////////////////////////
//---Utterance Reconstruction
///////////////////////////////////
function reconstructSentence(posSentence,ySentence){
	var ySen = strongSplit(ySentence); 
	var output =[];
	for(var i=0; i<ySen.length; i++){
		var yWord = ySen[i];
		for(var j = 0; j<posSentence.specialSentence.length; j++){
			var pWord = posSentence.specialSentence[j];
			if(pWord.word.toUpperCase() === yWord.toUpperCase()){
				output.push(pWord);
				break;
			}
		}
	}
	
	return output;
	
}

function reconstructSentences(posIncorrectOrder, correctOrder){
	var output = [];
	for(var i = 0; i<posIncorrectOrder.length; i++){
		var pSentence = posIncorrectOrder[i];
		var cSentence = correctOrder[i];
		output.push(reconstructSentence(pSentence,cSentence));
	}
	return output;
}



///////////////////////////////////
//---Grammar Construction
///////////////////////////////////
//First Word Grammar
function SpecialType(pos){
  this.type = pos;
  this.incrementer = 0;
}

function pushPOS(ePosUtterances, grammar){
	//grab every unique POS sentence start and...
	for(var i = 0; i < ePosUtterances.length; i++){
		var wordType = ePosUtterances[i].specialSentence[0].type;
		
		if(!(wordType in grammar)){
				addElement(grammar,wordType,[]);
		}
	}
}

function populateFirstWordOccurences(posUtterances,grammar){	
	for(var pos in grammar){
		var array = grammar[pos];		
		for(var i = 0; i < posUtterances.length; i++){
			for(var n = 0; n < posUtterances[i].specialSentence.length; n++){
				var wordType = posUtterances[i].specialSentence[n].type;

				if(!(wordType in array2object(array))){
					array.push(new SpecialType(wordType));
				}
			}
		}	
	}
}

function incrementFirstWordOccurences(eUtter,grammar){
	for(var pos in grammar){
		var array = grammar[pos];
		
		for(var i = 0; i < eUtter.length; i+= 1){
			var sentence = eUtter[i].specialSentence;
			
			if(sentence[0].type === pos){
				var ySentence = reorderedPosUtterances[i];
				
				for(var j = 0; j < array.length; j += 1){
					var sType = array[j];

					if(sType.type === ySentence[0].type){
						sType.incrementer += 1;
						break;
					}
				}
			}
		}
	}
}

function constructFirstWordGrammar(utterances,grammar){
	console.log("START CONSTRUCTING FIRST WORD GRAMMAR");
	pushPOS(utterances, grammar);
	populateFirstWordOccurences(utterances, grammar);
	incrementFirstWordOccurences(ePosUtterances,grammar);
	console.log(firstWordGrammar);
	console.log("DONE CONSTRUCTING FIRST WORD GRAMMAR");
}

var firstWordGrammar = {};


//Subsequent Word Grammar
var subWordGrammar = {};

function constructSentenceGrammar(posUtterances,grammar){
		console.log("START WITH SENTENCE GRAMMAR CONSTRUCTION");

	//push all yoda POS into array
	for(var i = 0; i < posUtterances.length; i++){
		var posSentence = posUtterances[i];

		for(var n = 0; n < posSentence.length; n++){
			var wordType = posSentence[n].type;

			if(!(wordType in grammar)){
				addElement(grammar,wordType,[]);
			}
		}
	}
	
		
	//push parts of speech into arrays
	for(var pos in grammar){
		var array = grammar[pos];
		
		for(var i = 0; i < posUtterances.length; i++){
			for(var n = 0; n < posUtterances[i].length; n++){
				var wordType = posUtterances[i][n].type;

				if(!(wordType in array2object(array))){
					array.push(new SpecialType(wordType));
				}
			}
		}
		
		//increment the number of occurances
		for(var i = 0; i < array.length; i++){
			var sType = array[i];

			for(var j = 0; j < posUtterances.length; j++)
			{
				var sSentence = posUtterances[j];
				for(var n = 0; n < sSentence.length; n++)
				{
					if(sSentence[n-1] && sType.type == sSentence[n].type)// && pos==sSentence[n-1].type)
					{
						sType.incrementer += 1;
					}
				}
			}
		}
	}
	
	console.log("DONE WITH SENTENCE GRAMMAR CONSTRUCTION");
}


//////////////////////////////////////
//---Translate Sentence
//////////////////////////////////////
function isPunct(test){
	if(test == "," || isEnd(test)){
		return true
	} else {
		return false;
	}
}

function isEnd(test){
	if(test == "."){ 
		return "."
	} else if(test == "!"){
		return "!"
	} else if(test == "?"){
		return "?"
	} else {
		return false;
	}
}

function createAnswer(posSentence){
	var unformatted = "";
	
	for(var i = 0; i<posSentence.length; i+=1){
		var pWord = posSentence[i];
		if(i != 0 && !(isPunct(pWord.word))){
			unformatted += " ";
		}
		unformatted += pWord.word;
	}
	
	return unformatted;
}

function formatString(unformatted){
	var formatted = "";
	var array = unformatted.split("");
	var end;
	
	for(var i = 0; i<array.length; i+=1){
		var oneCharString = array[i];

		if(isEnd(oneCharString)){
			end = isEnd(oneCharString);
			continue;
		}

		if(i == 0 || inContext(array[i-1],oneCharString,array[i+1])){
			formatted += oneCharString.toUpperCase();
		} else {
			formatted += oneCharString.toLowerCase();
		}
	}
	
	if(end){ formatted += end; }
	
	return formatted;
}

function inContext(charBefore,mainChar,charAfter){
	if(mainChar == "I"){
		if((charBefore == " " && charAfter == " ") || (charAfter == "'")){
			return true;
		}
	} else {
		return false;
	}
}

function determineFirstWord(posArray,answerArray){
	console.log("DETERMINING FIRST WORD");
	var posSentence = posArray[0];
	var firstWord = 1;
	var index;
	var bestProb = 0;
	var firstWordType = posSentence.specialSentence[0].type;
	var sTypeArray = firstWordGrammar[firstWordType];
	console.log(firstWordType);
	console.log(firstWordGrammar);
	for(var i=0;i<posSentence.specialSentence.length;i+=1){
		var sWord = posSentence.specialSentence[i];
					
		for(var j = 0; j<sTypeArray.length; j += 1){
			if(sWord.type == sTypeArray[j].type && sTypeArray[j].incrementer >= bestProb){
				firstWord = sWord;
				index = i;
				bestProb = sTypeArray[j].incrementer;
			}
		}
		

		/*
		for(var j = 0; j < firstWordGrammar.length; j += 1){
			var sType = firstWordGrammar[j];
			
		}	*/
	}
	posSentence.specialSentence.splice(index,1);
	answerArray.push(firstWord);
	var tp = posArray;
	var ta = answerArray;
	console.log(tp);
	console.log(ta);
	console.log("FINISHED DETERMINING FIRST WORD");
}

function constructSentence(posArray,answerArray){ //DEBUG HERE
	console.log("START CONSTRUCTING SENTENCE");
	var sSentence = posArray[0].specialSentence;
	var index = 0;
	
	while(sSentence.length != answerArray.length - 1){
		var nextWord;
		var bestProb = 0;
		var currentWord = answerArray[answerArray.length - 1];
		var currentSearchArray = subWordGrammar[currentWord.type];
	console.log(currentSearchArray);
		for(var i = 0; i<sSentence.length;i+=1){
			var sWord = sSentence[i];
			console.log(answerArray.indexOf(sWord) == -1);
			console.log(sWord);
			if(answerArray.indexOf(sWord) == -1){				
				for(var j = 0; j < currentSearchArray.length; j+=1){
					var sType = currentSearchArray[j];
					console.log((sWord.type) + " : " + (sType.type) + "|2nd condition: " + (sType.incrementer));
					if(sWord.type == sType.type && sType.incrementer >= bestProb){
						nextWord = sWord;
						index = i;
						bestProb = sType.incrementer;
						console.log(sWord);
						console.log(bestProb);
					}
				}
			}
		}
		
		if(index == sSentence.length - 1) { index = 0; }
				
		if(nextWord){ console.log('array push');console.log(nextWord); console.log("-----------------------");answerArray.push(nextWord); }
	}
			//console.log(answerArray);
}


function test(a1,a2){
	for(var i=0;i<a1.length;i+=1){
			console.log(a1[i].specialSentence); 
			console.log("^v");
			console.log(a2[i].specialSentence);
			console.log("----------------------------------------------");
	}
}

yPosUtters = [];

/////////////////////////////
//ON SUBMIT
/////////////////////////////
function buildGrammar(){
	//console.log(eUtterances.array().length);
	//test(eUtterances.array(),yUtterances.array());
	if(ePosUtterances.length != 0){ return false; }
	buildPOS(eUtterances.array(),ePosUtterances);
	buildPOS(yUtterances.array(),yPosUtters);
	test(ePosUtterances,yPosUtters);
	reorderedPosUtterances = reconstructSentences(ePosUtterances,yUtterances.array());
	constructFirstWordGrammar(ePosUtterances,firstWordGrammar);
	constructSentenceGrammar(reorderedPosUtterances,subWordGrammar);
	
}

function answerQuestion(){
	buildGrammar();
		
	var stringArray = [];
	var posAnswerSentence = [];
	var answerString = "";
	var input = document.getElementById('answer');
	var answer = input.value;

	if(!answer)
	{
		alert("Please enter a phrase!");
		return;
	}

	buildPOS([answer],stringArray);
	console.log(answer);
	determineFirstWord(stringArray,posAnswerSentence);
	constructSentence(stringArray,posAnswerSentence);
	answerString = formatString(createAnswer(posAnswerSentence));
	
	document.getElementById('answer').value = answerString;
}


