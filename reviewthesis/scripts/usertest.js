let localObj = {};
let curObj = {};
let curID;

function getUrlVars() {
  let vars = {};
  let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

function setSessionID(){
	curID = addUser();
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
			return nextPage(nextpage);
	  }
	} else if (curpage === "review-mashup.html"){
		let form = document.getElementById('coffeeform');
		if(form.checkValidity()){
			updateData("coffeemachine",getcheckedItem('coffeemachine'));
			updateData("coffeemachinetext",form.coffeemachinetext.value);
			return nextPage(nextpage);
		}
	} else if (curpage === "review-credibility.html"){
		let form = document.getElementById('credibilityform');
		if(form.checkValidity()){
			updateData("fullname",getcheckedItem('fullname')); //1
			updateData("nickname",getcheckedItem('nickname')); //2
			updateData("socialmedia",getcheckedItem('socialmedia')); //3
			updateData("avatar",getcheckedItem('avatar')); //4
			updateData("verified",getcheckedItem('verified')); //5
			updateData("endorsed",getcheckedItem('endorsed')); //6
			updateData("userfeedback",getcheckedItem('userfeedback')); //7
			updateData("sellerresponse",getcheckedItem('sellerresponse')); //8
			updateData("picture",getcheckedItem('picture')); //9
			updateData("privacy",getcheckedItem('privacy')); //10
			updateData("privacytext",form.privacytext.value); //11
			return nextPage(nextpage);
	  }
	} else if (curpage === "review-itr.html"){
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
			return nextPage(nextpage);

		}
  } else if (curpage === "review-itrreflection.html"){
		let form = document.getElementById('itrreflectionform');
		if(form.checkValidity()){
			updateData("reflection",getcheckedItem('reflection'));
			updateData("reflectiontext",form.reflectiontext.value);
			return nextPage(nextpage);
	  }
	}
}

function nextPage(nextpage){
	const path = window.location.href;
	const url = new URL(nextpage,path);
	url.searchParams.set('id', curID);
	window.location.href = url;
	return false;
}

function updateData(key,value){
	let sessionID = "id" + curID;
	let tempObj = JSON.parse(localStorage.getItem(sessionID));
	console.log(tempObj);
	tempObj[key] = value;
	strtempObj = JSON.stringify(tempObj);
	localStorage.setItem(sessionID,strtempObj);
}

function sumbitTest(){
	console.log('Submitting data for user ' + curID + '...');
	updateLocalTextFile("user"+curID,JSON.parse(localStorage["id"+curID]),true);
}

function init(){
	if(getSessionID()===undefined||getSessionID()===null){
		console.log('no session ID has been set, setting session ID...');
		setSessionID();
		console.log('session ID has been set to ' + curID + '.')
	} else {
		console.log('session ID is set to ' + getSessionID() + '.')
	}
}

function setPage(){
	getSessionID();
	curuser = curID;
	console.log(JSON.parse(localStorage["id"+curID]));
}
