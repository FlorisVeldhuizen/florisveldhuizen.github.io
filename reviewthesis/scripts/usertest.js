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

let credcontent = {
  daysago :
    [
      "3 days ago I got my hands on this.",
      "I got it last week.",
      "I bought this one a month ago.",
      "I've had this product for about six months.",
      "I have used it for the past year.",
      "I bought it 1.5 years ago."
    ],
  details :
    [
      "It is very durable, it feels strong. When I dropped it, there wasn't a single scratch!",
      "The rich deep bass works really well for upbeat tracks, like I'm standing right in the club.",
      "It feels very comfortable on my head, I can wear it all day long.",
      "It looks amazing and finishes a few of my outfits. Its neutral color makes it easy to match with everything!",
      "I love how balanced the sound of the headphones is, a very natural sound that fits all music.",
      "The battery on these headphones is amazing, they last one week of daily use on a single charge."
    ],
  detailsbad :
    [
      "I felt that the range is too focused on the bass, which makes regular songs sounds very muddy.",
      "While the material is supposed to be durable, after carrying it in my bag I could already see minor damages.",
      "I think they look way better on the online pictures than in real life. It feels like a scam."
    ],
  connection :
    [
      "I have bought other devices from the same brand, they never dissapoint.", //positive relation
      "I worked in audiotech for a few years, and the guys that are working on this clearly know what they are doing.", //Positive relation
      "This is the first time that I buy headphones from this brand, but I am sure it won't be the last.", //no relation positive
      "After looking at other options online, this one seemed to be the best value for money.", //no relation neutral
      "Before I got this pair of headphones, I have never bought anything from this brand before.", //no relation neutral
      "I bought something from this brand before, but was not particularly happy with it. I still wanted to give them a chance with these headphones, though.", //negative relation
    ],
  inline :
    [
      "I enjoy listening to my favorite songs with them!",
      "I would recommend this product.",
      "I would buy this again if it ever breaks.",
      "This is probably my new favorite pair of headphones!",
      "They do what they must do, which is good.", //neutral
      "My experience with it has been bad, I'm not happy with my new headphones. I wish I got other ones." //negative
    ],
  picture :
    [
      "url pic 1.",
      "url pic 2."
    ]
}

function generateReview(){
  let _credcontent = JSON.parse(JSON.stringify(credcontent));
  let content = [];
  let badreview = [1,0,0];
  let picreview = [1,1,0,0,0,0]

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  shuffleArray(badreview);
  badreview.push(0,0,0); //make sure there is enough fitting items in the connection array
  shuffleArray(picreview);

  for(let i = 0; i < badreview.length; i++ ){
    let tempcontent = "";
    let index;
    let lastday = false;

    if(badreview[i] == 0) {
      Object.keys(_credcontent).forEach(function(key) {
        index = Math.floor( Math.random()*_credcontent[key].length );
        if (_credcontent[key][index] == _credcontent.daysago[0]){
          lastday = true;
        }
        if (lastday && _credcontent[key] == _credcontent.details) {
          index = Math.floor( Math.random()*_credcontent[key].length - 1);
        }
        if (_credcontent[key] == _credcontent.detailsbad){
          return;
        }
        if (_credcontent[key] == _credcontent.inline){
          index = Math.floor( Math.random()*_credcontent[key].length - 1 );
        }
        if (_credcontent[key] == _credcontent.picture){
          if(picreview[i] == 1){
            index = Math.floor( Math.random()*_credcontent[key].length);
          } else {
            return;
          }
        }
        if(index<0)
          index = 0;
        tempcontent = tempcontent + " " + _credcontent[key][index];
        _credcontent[key].splice( index, 1 ); // Remove the item from the array
      });
    }
    else if(badreview[i] == 1) {
      Object.keys(_credcontent).forEach(function(key) {
        index = Math.floor( Math.random()*_credcontent[key].length );
        if (_credcontent[key][index] == _credcontent.daysago[0]){
          lastday = true;
        }
        if (_credcontent[key] == _credcontent.details){
          return;
        }
        if (_credcontent[key] == _credcontent.connection){
          index = Math.floor(Math.random()*_credcontent[key].length);
          if(index < 3 && _credcontent.connection.length > 3 ){
            index = 3 + Math.floor(Math.random()*(_credcontent[key].length - 3));
          }
        }
        if (_credcontent[key] == _credcontent.inline){
          index = _credcontent[key].length - 1;
        }
        if (_credcontent[key] == _credcontent.picture){
          if(picreview[i] == 1){
            index = Math.floor( Math.random()*_credcontent[key].length);
          } else {
            return;
          }
        }
        tempcontent = tempcontent + " " + _credcontent[key][index];
        _credcontent[key].splice( index, 1 ); // Remove the item from the array
      });
    }
    content[i] = tempcontent;
  }
  shuffleArray(content);
  console.log(content);
}

generateReview();
