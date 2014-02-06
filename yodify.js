//Request yoda JSON 
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
//---------------

var stringArray = new Array();
var yodaPOSmap = new Object();

var yodaStringArray = new Array();
var yodaSentenceArray = new Array();
var yodaPOSArray = new Array();

function specialWord(sentWord, sentType)
{
	this.theWord = sentWord;
	this.type = sentType;
}

function lexiconFunction(theInput)
{
	this.specialSentence = new Array();

	var words = new Lexer().lex(theInput);
	var taggedWords = new POSTagger().tag(words);
		   
	for (i in taggedWords) {
		var taggedWord = taggedWords[i];
		var word = taggedWord[0];
		var tag = taggedWord[1];            

		this.specialSentence.push(new specialWord(word, tag));
	}
	//console.log(this.specialSentence);
}

function buildPOS(posArray,sentenceArray)
{
	console.log("buildYodaPOS start");

	for(var i = 0; i<sentenceArray.length; i++)
	{
		var sentence = sentenceArray[i];

		yodaSentenceArray.push(sentence); ///REDUNDANT! using sentence array to make the same sentence arrary

		posArray.push(new lexiconFunction(sentence)); //yodaStringArray is not a string array. It's a specialword array
	}
	

	for(var i = 0;i<posArray.length;i++)
	{ 
		var str = posArray[i].specialSentence;
		for(var j = 0; j<str.length; j++)
		{
			console.log(i +": "+str[j].theWord+" => "+str[j].type);
		}
	}

	console.log("DONE MAKING YODASTRINGARRAY\n");
}

function findFirst()
{
  console.log("RUNNING findFIRST");
  
  var typeArray = {};
  
  for(var i = 0; i<yodaStringArray.length; i++)
  {
 if(i == 0)
 {
	typeArray.push(new typeArrayObject(yodaStringArray[0][0].theType));
 }
 
 else
 {
	for(var j = 0; j<typeArray.length; j++)
	{
	   if(yodaStringArray[i][0].theType == typeArray[j].type)
	   {
	  typeArray[j].incrementer++;
	   }
	   else
	   {
	  typeArray.push(new typeArrayObject(yodaStringArray[i][0].theType));
	   }
	}
 }
  }
}

function typeArrayObject(theType)
{
  this.type = theType;
  this.incrementer = 1;
}

function addElement(map, key, value)
{
  map[key] = value;
  return map;
}



function answerQuestion()
{
	console.log("answerQuestion start");

	buildPOS(yodaStringArray,YosonObject);

	var input = document.getElementById('answer');
	var answer = input.value;

	if(!answer)
	{
		document.getElementById('answer').value = "Please enter you answer!";
		return;
	}

	buildPOS(stringArray,[answer]);


	//t2y();
	console.log("answerQuestion end");
}



function t2y()
{
	var g = new Array("U", "R", "J", "N", "P", "D", "V", "I");

for(var i = 0; i<stringArray.length; i++)
{
 stringArray[i].type = stringArray[i].type.charAt(0);
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