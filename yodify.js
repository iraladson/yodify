//Yodafy
/////////////////////////////
//ON SUBMIT
/////////////////////////////
function yodafy(){

	var answerString = "";
	var contraction = false;
	var input = document.getElementById('answer');
	var text = input.value;

	if(!text)
	{
		alert("Please enter some text!");
		return;
	}
	
	//Divide the text into sentences
	var sentences = divideText(text);
	

	//for each sentence...
	for(var s=0; s < sentences.length; s+=1){
		var sentence = sentences[s];
		var tempAnswerString = "";
		//sentence = handleComplex(sentence);
		//console.log(sentence);
		//check for contractions
		//for(var n=0; n < sentence.length; n+=1){
			//var part = sentence[n];
			var stringArray = [];
			var posAnswerSentence = [];

			for(var i = 0; i<sentence.split(" ").length; i+=1){
				if(hasApostIn(sentence.split(" ")[i])){
					contraction = true;
					break;
				}
			}
			sentence = removeApostFrom(sentence,contraction);
		
			buildPOS([sentence],stringArray);
			posAnswerSentence = decideApproach(stringArray[0].specialSentence);
			//console.log(posAnswerSentence);
			//determineFirstWord(stringArray,posAnswerSentence);
			//constructSentence(stringArray,posAnswerSentence);
			tempAnswerString += convertToOSV(posAnswerSentence);
			if( i != sentence.length-1){ tempAnswerString += " "; }
			console.log(answerString);

		//}
		answerString += formatString(tempAnswerString);
		if( s != sentences.length-1){ answerString += " "; }

	}
		
	document.getElementById('answer').value = answerString;
}


function divideText(text){
	var answers = [];
	var sentence = "";

	for(var i=0; i<text.length; i+=1){
		var character = text[i];
		sentence += character;
		
		if(isEnd(character)){
			answers.push(sentence);
			sentence = "";
		}
	}
	return answers;
}

function handleComplex(answer){
	var answers = [];
	
	var split = function(divider){
		answers = answer.trim().split(divider);
		console.log(answers);
		for(var i=0; i<answers.length; i+=1){
			if(i != answers.length-1){
				answers[i] = answers[i].concat(divider);
			}
		}
		return answers;
	}
	
	if(answer.indexOf(", ") != -1){
		return split(", ");
	}
	
	if(answer.indexOf("and ") != -1){
		return split("and ");
	}
	
	answers.push(answer);
	return answers
}

function decideApproach(posSentence){
	
	//Handle mistags of verbs
	for(var i=0; i<posSentence.length;i+=1){
		if(posSentence[i].type == 'V'){ break; }
		if(i==posSentence.length-1){ return handleMistag(posSentence,0) }
	}

	//Handle questions
	//Do...?
	if(posSentence[0].word.toLowerCase() == 'do' && posSentence[0].type == 'V'){
		posSentence[0].type = 'N';
		for (var i = 0; i < posSentence.length; i+=1) {
			if(posSentence[i].type == 'V'){ break; }
			if(i==posSentence.length-1){ return handleMistag(posSentence,1,true)}
		};
	}

	//Why..?
	if(posSentence[0].word.toLowerCase() == 'why'){
		posSentence.splice(1,1);
		return { s : posSentence, v : [], o : [] };
	}
	
	return identifySVO(posSentence);
}

function hasApostIn(word){
	if(word.indexOf("'") != -1){ return true; }
	
	return false;
}

function removeApostFrom(sentence){
	var senArray = sentence.split(" ");
	var newSen = "";
	for(var i=0; i<senArray.length;i+=1){
		if(i != 0) { newSen += " "; }
		var word = senArray[i];
		
		if(hasApostIn(word)){
			if(word.indexOf("n't") != -1){
				var s = word.split("n'");
				newSen =  newSen + s[0] + " " + "not";
				continue;
			} else {
				var s = word.split("'");
				newSen = newSen + s[0] + " ";
				switch(s[1]){
					case "m" : newSen += "am";
						break;
					case "re" : newSen += "are";
						break;
					case "s" : newSen += "is";
						break;
					case "ve" : newSen += "have";
						break;
					case "d" : newSen += "did";
						break;
					case "ll" : newSen += "will";
				}
				continue;
			}
		}
		newSen += word;
	}
	return newSen;
}

//Retag with appropriate tagging.
function handleMistag(posSentence,start){
	for(var i=start; i<posSentence.length;i+=1){
		if(posSentence[i].type == 'N'){
			posSentence[i].type = 'V';
			break;
		}
	}
	
	return identifySVO(posSentence);	
}

//Identify Subject/Verb/Object

function identifySVO(posSentence){
	var subject = [];
	var verb = [];
	var object = [];
	var index = 0;
	console.log(posSentence);
	var punct = isPunct(posSentence[posSentence.length-1].word);
	
	(function(){
		for(var i=index;i<posSentence.length;i += 1){
			if(posSentence[i].type != 'V'){
				subject.push(posSentence[i]);
			} else {
				index = i;
				return;
			}
		}
	})();
	
	(function(){
			verb.push(posSentence[index]);
			
			if(punct){
				verb.push(posSentence[posSentence.length-1]);
			}
			index += 1;
			return;
	})();
	
	(function(){
		for(var i=index;i<posSentence.length;i += 1){
			if(!punct || (punct && i != posSentence.length-1)){
				object.push(posSentence[i]);
			}
		}
	})();

	return { s : subject, v : verb, o : object };
}

//Educational Documentation
//If excessive documentation is a turn off, see devYodafy.js
//anthony ladson
//aladso@saic.edu  || iraladson.github

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
	} else if(test == ";"){
		return ";"
	} else {
		return false;
	}
}

function convertToOSV(posSentence){
	var unformatted = "";
	var object = posSentence.o;
	var subject = posSentence.s;
	var verb = posSentence.v;
	
	for(var i = 0; i<object.length; i+=1){
		var pWord = object[i];
		if(i != 0 && !(isPunct(pWord.word))){
			unformatted += " ";
		}
		unformatted += pWord.word;
	}
	
	unformatted += " ";
	
	for(var i = 0; i<subject.length; i+=1){
		var pWord = subject[i];
		if(i != 0 && !(isPunct(pWord.word))){
			unformatted += " ";
		}
		unformatted += pWord.word;
	}
	
	unformatted += " ";

	
	for(var i = 0; i<verb.length; i+=1){
		var pWord = verb[i];
		if(i != 0 && !(isPunct(pWord.word)) && (i >= verb.length-2)){
			unformatted += " ";
		}
		unformatted += pWord.word;
	}
	return unformatted;
}

function formatString(unformatted){
	var formatted = "";
	var array = unformatted.trim().split("");
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
	console.log(array);
	console.log(formatted);
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


/////////VISUALIZATION

var yBody = new Image();
var yMouth = new Image();
yBody.src = "imgs/yBack.png";
yMouth.src = "imgs/yFront.png";


var canvas = document.getElementById("yoda");
ctx = canvas.getContext("2d");


function resizeCanvas(){
	if(yBody.complete){
		canvas.width = yBody.width;
		canvas.height = yBody.height;
		ctx.drawImage(yBody,0,0);
		ctx.drawImage(yMouth,0,0);
	} else {
		setTimeout(resizeCanvas,200);
	}
}

setTimeout(resizeCanvas,200);
