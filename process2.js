/*
approach 1 - frequency-based
creates a bazillion radicals. unsuitable!
*/

var fs = require('fs')

var dat = fs.readFileSync("processed3.txt","utf-8")
var lines = dat.split("\n")

var lines = lines.filter(l => l.length===5||l.length===7);

var characters = [];
var dictionary = {};
var freq = {};
var charcount=0;
for (var i=0;i<lines.length;i++){
	var l = lines[i];
	for (var j=0;j<l.length;j++){
		var c = l[j];
		if (characters.indexOf(c)<0){
			characters.push(c);			
		}
		if (c in dictionary){
			dictionary[c].push(i);
			freq[c]++;
		} else {
			dictionary[c]=[i];
			freq[c]=1;
		}
		charcount++;
	}
}

var frequencies = new Int32Array(characters.length);
for (var i=0;i<characters.length;i++){
	var c = characters[i];
	frequencies[i]=-parseInt(freq[c])
}
frequencies.sort();


var s = "";
for (var i=0;i<frequencies.length;i++){
	s+=`${i}\t${-frequencies[i]}\n`;
}
fs.writeFileSync("frequencies.txt",s)


var sortedchars = [];
var s = "";
for (var i=0;i<frequencies.length;i++){
	var f = frequencies[i];
	if (i>0&&frequencies[i]===frequencies[i-1]){
		continue;
	}
	for (var j=0;j<characters.length;j++){
		var c = characters[j];
		if (freq[c]===i){
			sortedchars.push(c);
			s+=`${c}\t${freq[c]}\n`
		}
	}
}
fs.writeFileSync("frequentchars.txt",s)
fs.writeFileSync("sortedchars.txt",sortedchars.reverse().join(""))


console.log(`characters length ${characters.length}.`)
console.log(`dictionary length ${ Object.keys(dictionary).length}.`)
console.log(`charcount ${charcount}.`)


possibleMnemonics={}
for (var i=0;i<characters.length;i++){
	var c = characters[i];
	var mnemonicList=[];
	for (var j=0;j<lines.length;j++){
		var l = lines[j];
		var index=l.indexOf(c);
		if (index>=0){
			for (var k=0;k<l.length-1;k++){
				for (var k2=k+1;k2<l.length;k2++){
					var cand = l[k]+""+l[k2];	
					if (cand.indexOf(c)===-1){
						if (mnemonicList.indexOf(cand)===-1){
							mnemonicList.push( cand );
						}
					}			
				}
			}		
		}
	}
	possibleMnemonics[c]=mnemonicList;
	//console.log(c,mnemonicList);
}


var dictionary={};
var reverseDictionary={};
var dictionaryDepth={};
var maxDepth=3;
var radicalCount=50;
var radicalsAllocated=0;

//assign things by frequencies;
for (var i=0;i<sortedchars.length;i++){
	var c = sortedchars[i];
	//if it can be explained in terms of previous characters
	var mnemonicList = possibleMnemonics[c]; 
	var allocated=false;

	for (var j=0;j<mnemonicList.length;j++){
		var mnemonic = mnemonicList[j];
		var ma = mnemonic[0];
		var mb = mnemonic[1];
		if ( (ma in dictionary) && (mb in dictionary) ){
			var dd1 = dictionaryDepth[ma];
			var dd2 = dictionaryDepth[mb];
			var dd = Math.max(dd1,dd2);
			if ( (dd+1<maxDepth) ) {
				var r1 = dictionary[ma];
				var r2 = dictionary[mb];
				var compound = `(${r1}, ${r2})`
				if (!(compound in reverseDictionary )){
					dictionary[c]=compound
					reverseDictionary[compound]=c;
					dictionaryDepth[c]=dd+1;
					console.log(`${c} = ${dictionary[c]}`)
					allocated=true;		
				}
				break;	
			}
		}
	}

	if (!allocated){
		dictionary[c]=radicalsAllocated.toString();
		reverseDictionary[radicalsAllocated.toString()]=c;
		dictionaryDepth[c]=0;
		radicalsAllocated++;
	}
}

console.log(dictionary)
console.log("radicals allocated  " +radicalsAllocated);
