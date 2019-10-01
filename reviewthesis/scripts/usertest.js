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
	console.log(vars.id);
	return vars.id;
}

function fillData(){
	curObj.id = curID;
	curObj.q1 = "question 1 answer";
	curObj.q2 = "question 2 answer";
}

function updateData(key,value){
	let sessionID = "id" + curID;
	let tempObj = JSON.parse(localStorage.getItem(sessionID));
	console.log(tempObj);
	tempObj[key] = value;
	strtempObj = JSON.stringify(tempObj);
	localStorage.setItem(sessionID,strtempObj);
}

// fillData();
setSessionID();
getSessionID();
updateData("oi","test");
updateData("yo","test");

let strcurObj = JSON.stringify(curObj);
// console.log(strcurObj);
//localStorage.setItem("id"+curID,strcurObj);

console.log(localStorage);
