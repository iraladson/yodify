//by Anthony Ladson, Miguel Perez, and Michael Fox
//POS == Parts Of Speech

//---Request yoda JSON 
var req = new XMLHttpRequest();
var YosonObject = {}; //store json array from request

function makeReq(){
	req.onload = function(){
  		var html = this.responseText;
		YosonObject = JSON.parse(html)['yosonArray'];
	}
	req.open("GET","yoson.json",true);
	req.send();
}

makeReq();

//---Classes
//tag sentWord with POS
//Fox
function SpecialWord(sentWord, sentType)
{
	this.theWord = sentWord;
	this.type = sentType;
}

//Convert each word in theInput to a SpecialWord{}
//Perez
function LexiconSentence(theInput)
{
	var words = new Lexer().lex(theInput);
	var taggedWords = new POSTagger().tag(words);
	
	this.specialSentence = new Array();
		   
	for (i in taggedWords) {
		var taggedWord = taggedWords[i];
		var word = taggedWord[0];
		var tag = taggedWord[1];            

		this.specialSentence.push(new SpecialWord(word, tag));
	}
}

//---BUILD GRAMMAR
//converts each sentence in sentenceArray to a LexiconSentence in the posArray
//Fox
function buildPOS(posArray,sentenceArray)
{
	for(var i = 0; i<sentenceArray.length; i++)
	{
		var sentence = sentenceArray[i];

		posArray.push(new LexiconSentence(sentence)); 
	}	
}

//Fox
function specialType(POS)
{
  this.type = POS;
  this.incrementer = 0;
}

function addElement(map, key, value)
{
  map[key] = value;
  return map;
}


//Build Yoda Grammar
//Ladson
var yodaGrammarFirstWord = [];
var yodaGrammarSentence = {};

function constructFirstWordGrammar()
{
	console.log("STARTING first word grammar");
	
	//grab every unique POS sentence start and...
	for(var i = 0; i < yodaStringArray.length; i++)
	{
		var wordType = yodaStringArray[i].specialSentence[0].type;
		if(i===0)
		{ 
			yodaGrammarFirstWord.push(new specialType(wordType)); 
		} 
		else if(!(wordType in array2object(yodaGrammarFirstWord)))
		{
			yodaGrammarFirstWord.push(new specialType(wordType));
		}
	}
	
	//...increment how often it occurs
	for(var i=0;i<yodaGrammarFirstWord.length;i++)
	{
		var sType = yodaGrammarFirstWord[i].type;
		for(var j = 0; j< yodaStringArray.length; j++)
		{
			var yType = yodaStringArray[j].specialSentence[0].type;
			
			if(sType == yType) { yodaGrammarFirstWord[i].incrementer += 1; }
		}
	}	
}


var stringArray = new Array();
var yodaPOSmap = new Object();

var yodaStringArray = new Array();
var yodaSentenceArray = new Array();
var yodaPOSArray = new Array();



////////////////////////
///Grammar construction




function constructSentenceGrammar()
{
	//push all yoda POS into array
	for(var i = 0; i < yodaStringArray.length; i++)
	{
		for(var n = 0; n < yodaStringArray[i].specialSentence.length; n++)
		{
			var posArray = [];
			var wordType = yodaStringArray[i].specialSentence[n].type;

			if(!(wordType in yodaGrammarSentence))
			{
				addElement(yodaGrammarSentence,wordType,[]);
			}
		}
	}
	
	//push parts of speech into arrays
	for(var pos in yodaGrammarSentence){
		var array = yodaGrammarSentence[pos];
		
		for(var i = 0; i < yodaStringArray.length; i++)
		{
			for(var n = 0; n < yodaStringArray[i].specialSentence.length; n++)
			{
				var wordType = yodaStringArray[i].specialSentence[n].type;

				if(!(wordType in array2object(array)))
				{
					array.push(new specialType(wordType));
				}
			}
		
		}
	
		//increment the number of occurances
		for(var i = 0; i < array.length; i++){
			var sType = array[i];
			//console.log("POS => " + pos);
			for(var j = 0; j < yodaStringArray.length; j++)
			{
				var sSentence = yodaStringArray[j].specialSentence;
				for(var n = 0; n < sSentence.length; n++)
				{
					if(sSentence[n-1] && sType.type == sSentence[n].type && pos==sSentence[n-1].type)
					{
						sType.incrementer += 1;
					}
				}
			}
		}
	}
	
	console.log("Done with sentence grammar construction");
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







function determineFirstWord(sa){
	var sSentence = stringArray[0].specialSentence;
	var firstWord;
	var index;
	var bestProb = 0;
	
	for(var i=sSentence.length-1;i>0;i--){
		var sWord = sSentence[i];
		for(var j = 0; j < yodaGrammarFirstWord.length; j++)
		{
			var sType = yodaGrammarFirstWord[j];
			if(sWord.type == sType.type && sType.incrementer > bestProb){
				firstWord = sWord;
				index = i;
			//	console.log(firstWord);
			//	console.log(sType);
				bestProb = sType.incrementer;
			}
		}	
	}
	sSentence.splice(index,1);
	sa.push(firstWord);
}

function constructSentence(sa){
	console.log("SENTENCE CONSTRUCTION!!!");
	var sSentence = stringArray[0].specialSentence;
	
	while(sSentence.length > 0){
		var nextWord;
		var currentWord = sa[sa.length-1];
		var index;
		var bestProb = 0;
		var currentSearchArray = yodaGrammarSentence[currentWord.type];
		
		for(var j=0; j<sSentence.length; j++){
			var sWord = sSentence[j];
			console.log(sWord);
			for(var i=0; i<currentSearchArray.length;i++){
				var sType = currentSearchArray[i];
				if(sWord.type == sType.type && sType.incrementer >= bestProb)
				{
					nextWord = sWord;
					index = j;
					bestProb = sType.incrementer;
				}
			}
		}
		
		if(nextWord == undefined) { alert("UNDEFINED!!!!!"); }
		bestProb = 0;
		sSentence.splice(index,1);
		sa.push(nextWord);
		
	}
	
}

//by anthony
function outputSentence(sa)
{
	var s = ""
	for(var i=0;i<sa.length;i++)
	{
		var word = sa[i].theWord;
		
		if(i==0)
		{
			word.charAt(0).toUpperCase();
		}
		else
		{
			word.toLowerCase();
		}
		
		s += " ";
		s += word;
	}
	
	return s;
}

function answerQuestion()
{
	var answerArray = [];
	var answerString = "";
	
	console.log("answerQuestion start");
	
	//tagging yoda utterances from training set 
	buildPOS(yodaStringArray,YosonObject);
	
	//decide how yoda starts sentences
	constructFirstWordGrammar();
	
	//determine which POS follow which POS
	constructSentenceGrammar();
	
	
	var input = document.getElementById('answer');
	var answer = input.value;

	if(!answer)
	{
		document.getElementById('answer').value = "Please enter you answer!";
		return;
	}

	buildPOS(stringArray,[answer]);
	determineFirstWord(answerArray);
	constructSentence(answerArray);
	answerString = outputSentence(answerArray);
	
	console.log(answerString);
	document.getElementById('answer').value = answerString;
	//t2y();
	console.log("answerQuestion end");
}



function t2y()
{
	var g = new Array("U", "R", "J", "N", "P", "D", "V", "I");

for(var i = 0; i<stringArray.length; i++)
{
 stringArray[i].specialSentence.type = stringArray[i].type.charAt(0);
}

var newSentence = "";

for(var i = 0; i<g.length; i++)
{
	for(var j = 0; j<stringArray.length; j++)
	{
	   if(stringArray[j].type == g[i])
	   {
	  newSentence = newSentence + stringArray[j].theWord;
	  newSentence = newSentence + " ";
	   }
	   
	   else
	   {
	  console.log(stringArray[j].theWord);
	   }
	}
}

alert(newSentence);

newSentence = "";
stringArray = [];
}