let localObj = {};
let curObj = {};
let curID;

function saveFile(data,filename){
	text = data.toString();
	//filename = "test";
	let blob = new Blob([text], {type: "text/plain;charset=utf-8"});
	saveAs(blob, filename+".txt");
}

function getUrlVars() {
  let vars = {};
  let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

function setSessionID(){
	curID = Object.keys(localStorage).length;
	let url = new URL(window.location.href);
	url.searchParams.set('id', curID);
	if (window.history.replaceState) {
   window.history.replaceState("Idset", "Usertest", url);
	}
	//setup session object
	localStorage.setItem("id"+curID,"{}");
}

function getSessionID(){
	let vars = getUrlVars();
	curID = vars.id;
	return vars.id;
}

function getcheckedItem(inputname){
	let rates = document.getElementsByName(inputname);
	let rate_value;
	for(let i = 0; i < rates.length; i++){
	    if(rates[i].checked){
	        rate_value = rates[i].value;
	    }
	}
	return rate_value;
}

function setPageData(curpage,nextpage){
	if(curpage === "introduction"){
		let form = document.getElementById('introductionform');
		if(form.checkValidity()){
			updateData("gender",getcheckedItem('gender'));
			updateData("age",form.age.value);
			nextPage(nextpage);
			return false;
	  }
	} else if (curpage === "review-mashup"){
		let form = document.getElementById('coffeeform');
		if(form.checkValidity()){
			updateData("coffeemachine",getcheckedItem('coffeemachine'));
			updateData("coffeemachinetext",form.coffeemachinetext.value);
			nextPage(nextpage);
			return false;
		}
	} else if (curpage === "review-credibility"){
		let form = document.getElementById('credibilityform');
		if(form.checkValidity()){
			updateData("fullname",getcheckedItem('fullname'));
			updateData("nickname",getcheckedItem('nickname'));
			updateData("socialmedia",getcheckedItem('socialmedia'));
			updateData("avatar",getcheckedItem('avatar'));
			updateData("verified",getcheckedItem('verified'));
			updateData("endorsed",getcheckedItem('endorsed'));
			updateData("userfeedback",getcheckedItem('userfeedback'));
			updateData("picture",getcheckedItem('picture'));
			nextPage(nextpage);
			return false;
	  }
	} else if (curpage === "review-itr"){
		let form = document.getElementById('itrform');
		if(form.checkValidity()){
			updateData("prompt",getcheckedItem('prompt'));
			updateData("prompttext",form.prompttext.value);
			updateData("discount",getcheckedItem('discount'));
			updateData("discounttext",form.discounttext.value);
			updateData("credits",getcheckedItem('credits'));
			updateData("creditstext",form.creditstext.value);
			updateData("doubleblind",getcheckedItem('doubleblind'));
			updateData("doubleblindtext",form.doubleblindtext.value);
			nextPage(nextpage);
			return false;
		}
  } else if (curpage === "review-itrreflection"){
		let form = document.getElementById('itrreflectionform');
		if(form.checkValidity()){
			updateData("reflection",getcheckedItem('reflection'));
			updateData("reflectiontext",form.reflectiontext.value);
			nextPage(nextpage);
			return false;
	  }
	}
}

function nextPage(nextpage){
	const path = window.location.href;
	const url = new URL(nextpage,path);
	url.searchParams.set('id', curID);
	window.location.href = url;
}

function updateData(key,value){
	let sessionID = "id" + curID;
	let tempObj = JSON.parse(localStorage.getItem(sessionID));
	console.log(tempObj);
	tempObj[key] = value;
	strtempObj = JSON.stringify(tempObj);
	localStorage.setItem(sessionID,strtempObj);
}

function init(){
	if(getSessionID()===undefined||getSessionID()===null){
		console.log('no session ID has been set, setting session ID...');
		setSessionID();
		console.log('session ID has been set to ' + curID + '.')
	}
}

function setPage(){
	getSessionID();
}


let strcurObj = JSON.stringify(curObj);
// console.log(strcurObj);
//localStorage.setItem("id"+curID,strcurObj);

console.log(localStorage);
