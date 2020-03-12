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
  } else if (curpage === "review-platform.html"){
		let form = document.getElementById('platformform');
		if(form.checkValidity()){
			updateData("platformuser",getcheckedItem('platformuser'));
			updateData("platformusertext",form.platformusertext.value);
			return nextPage(nextpage);
		}
  } else if (curpage === "review-headphones.html"){
		let form = document.getElementById('headphonesform');
		if(form.checkValidity()){
      updateData("headphonesreviewcontent",favreview);
			updateData("headphonesreviewtext",form.headphonesreviewtext.value);
      updateData("interestreviewtext",form.interestreviewtext.value);
			return nextPage(nextpage);
		}
  } else if (curpage === "review-ushaped.html"){
		let form = document.getElementById('ushapeform');
		if(form.checkValidity()){
			updateData("middleexperiencetext",form.middleexperiencetext.value);
      updateData("simpleratingtext",form.simpleratingtext.value);
      updateData("fairratingtext",form.fairratingtext.value);
			return nextPage(nextpage);
		}
  } else if (curpage === "review-gamification.html"){
    let form = document.getElementById('gamificationform');
    if(form.checkValidity()){
      updateData("gamificationrewardtext",form.gamificationrewardtext.value);
      updateData("gamificationchallengetext",form.gamificationchallengetext.value);
      updateData("gamificationmeaningfultext",form.gamificationmeaningfultext.value);
      updateData("gamificationinteractivitytext",form.gamificationinteractivitytext.value);
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
      "3 days ago I got my hands on these headphones.",
      "I got my fresh pair of Sony headphones last week.",
      "One month ago I decided to get new headphones.",
      "I've had this product for about six months.",
      "Last year I purchased them, and I have used it over the year.",
      "I bought my pair 1.5 years ago."
    ],
  details :
    [
      "The headphones are very durable, the material feels strong. When I dropped them, there wasn't a single scratch!",
      "The rich deep bass works really well for upbeat tracks, like I'm standing right in the club.",
      "It feels very comfortable on my head, I can wear it all day long.",
      "It looks amazing and finishes a few of my outfits. Its neutral color makes it easy to match with everything!",
      "I love how balanced the sound of the headphones is, a very natural sound that fits all music.",
      "The battery on these headphones is amazing, they last one week of daily use on a single charge.",
      "The noise cancelling feature is great, living next to a cafe makes me appreciate the clean music even more!"
    ],
  detailsbad :
    [
      "I felt that the range is too focused on the bass, which makes regular songs sounds very muddy.",
      "While the material is supposed to be durable, after carrying it in my bag I could already see minor damages.",
      "I think they look way better on the online pictures than in real life. It feels like a scam.",
      "The noise cancelling feature works abysmall, I can still hear noises around the house easily through the music.",
      "After wearing them all day my head hurts, they don't feel comfortable after a few hours of wearing..."
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
      "I added a picture to my review to show what mine look like.",
      "You can see what they look like in the picture that I added!"
    ]
}

const persons = [
  "Johan de Vadder",
  "Ronald Jonkheer",
  "Bart Ochtendschalker",
  "Geert Snoeibrug",
  "Marian Ketelburgh",
  "Eva van Kampen"
]

const pictures = [
  "natural-female.jpg",
  "selfie-female.jpg",
  "selfie-creepydude.jpg",
  "natural-male.jpg",
  "pose-male.jpg",
  "hands-male.jpg"
]

function generateReview(){
  let _credcontent = JSON.parse(JSON.stringify(credcontent));
  let content = [];
  let details = [];
  let badreview = [1,0,0];
  let picreview = [1,1,0,0,0,0];

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
    let reviewdetails = {};

    //personal details
    index = Math.floor( Math.random()*persons.length );
    reviewdetails.person = persons[index];
    if(reviewdetails.person == "Marian Ketelburgh" || reviewdetails.person == "Eva van Kampen"){
      reviewdetails.gender = "F";
    } else {
      reviewdetails.gender = "M";
    }
    persons.splice( index, 1 ); // Remove the item from the array

    //review content
    if(badreview[i] == 0) {
      Object.keys(_credcontent).forEach(function(key) {
        index = Math.floor( Math.random()*_credcontent[key].length );
        if (_credcontent[key][index] == _credcontent.daysago[0]){
          lastday = true;
        }
        if (lastday && _credcontent[key] == _credcontent.details) {
          index = Math.floor( Math.random()*(_credcontent[key].length - 1));
        }
        if (_credcontent[key] == _credcontent.detailsbad){
          return;
        }
        if (_credcontent[key] == _credcontent.inline){
          index = Math.floor( Math.random()*(_credcontent[key].length - 1));
        }
        if (_credcontent[key] == _credcontent.picture){
          if(picreview[i] == 1){
            index = Math.floor( Math.random()*_credcontent[key].length);
            let picindex;
            if(reviewdetails.gender == "F"){
              picindex = Math.floor( Math.random()*(pictures.length - 4));
            } else {
              picindex = 2 + Math.floor( Math.random()*(pictures.length - 2));
            }
            reviewdetails.picture = '<a href="images/'+ pictures[picindex] +'" class="mfp-gallery"><img src="images/'+ pictures[picindex] +'" alt=""></a>';
            pictures.splice( picindex, 1 ); // Remove the item from the array
          } else {
            return;
          }
        }
        if(index<0)
          index = 0;
        tempcontent = tempcontent + " " + _credcontent[key][index];
        _credcontent[key].splice( index, 1 ); // Remove the item from the array
      });
      reviewdetails.stars = (Math.floor(Math.random() * 3))/2 + 4;
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
            let picindex;
            if(reviewdetails.gender == "F"){
              picindex = 0;
            } else {
              picindex = 2 + Math.floor( Math.random()*(pictures.length - 2));
            }
            reviewdetails.picture = '<a href="images/'+ pictures[picindex] +'" class="mfp-gallery"><img src="images/'+ pictures[picindex] +'" alt=""></a>';
            pictures.splice( picindex, 1 ); // Remove the item from the array
          } else {
            return;
          }
        }
        tempcontent = tempcontent + " " + _credcontent[key][index];
        _credcontent[key].splice( index, 1 ); // Remove the item from the array
      });
      reviewdetails.stars = (Math.floor(Math.random() * 4) + 1)/2;
    }
    reviewdetails.content = tempcontent;
    details[i] = reviewdetails;
  }
  return details;
}

function capturePerson(review){
  let person = {};
  person.gender = review.gender;
  person.name = review.person;
  person.picture = false;
  if(review.picture !== undefined)
    person.picture = true;
  person.review = review.content;
  return person;
}

function selectItem(){
  for(let i = 0; i < reviewdivs.length; i++){
    reviewdivs[i].style.border = "none";
  }
  reviewoptions[this.value-1].checked = true;
  favreview = capturePerson(reviewbundle[this.value-1]);
  this.style.border = "2px solid #0000FF";
  console.log(favreview);
}

function selectRadio(){
  for(let i = 0; i < reviewdivs.length; i++){
    reviewdivs[i].style.border = "none";
  }
  reviewdivs[this.value-1].style.border = "2px solid #0000FF";
  favreview = capturePerson(reviewbundle[this.value-1]);
  console.log(favreview);
}

let reviewbundle = generateReview();
let favreview;

const reviewoptions = document.getElementsByName("headphonesreview");
const reviewdivs = document.getElementsByClassName("productreview");
const reviewlocs = document.getElementsByClassName("review-content");
const commentcontent = document.getElementsByClassName("comment-content");
const usernames = document.getElementsByClassName("username");
const ratings = document.getElementsByClassName("star-rating");

for(let i = 0; i < reviewdivs.length; i++){
  reviewdivs[i].addEventListener("click", selectItem, false);
  reviewoptions[i].addEventListener("click", selectRadio, false);
}

for(let i = 0; i < reviewlocs.length; i++){
  usernames[i].innerHTML = reviewbundle[i].person;
  reviewlocs[i].innerHTML = reviewbundle[i].content;
  ratings[i].setAttribute("data-rating",reviewbundle[i].stars);
  if(reviewbundle[i].picture !== undefined) {
    commentcontent[i].insertAdjacentHTML( 'beforeend', '<div class="review-images mfp-gallery-container">' + reviewbundle[i].picture + '</a></div>' );
  }
}
