firebase.initializeApp({
  apiKey: "AIzaSyC4WX9r28ZQ_EqSj0mjMdojpclsG3sHWp8",
  projectId: "picobellyapp",
  storageBucket: "picobellyapp.appspot.com",
  messagingSenderId: "317697032693"
});

/* START OF UPLOAD ANIIMATION CODE */
let uploadCounter = 0;
let uploadFail = false;
const updateUploadProgress = () => {
  uploadCounter++;
}

function progressingBar() {
  let elem = document.getElementById("myBar");
  let width = 1;
  let id = setInterval(frame, 10);
  let imageDone;
  function frame() {
    if(imgUploadFiles.length > 0){
      imageDone = 100 * uploadCounter / imgUploadFiles.length;
    } else {
      imageDone = 100;
    }
    if (width >= 100) {
      clearInterval(id);
      console.log("upload finished!");
      //finishedUpload();
      showPopup('done-popup');
    } else if (width < imageDone){
      width++;
      elem.style.width = width + '%';
    }
  }
}
/* END OF UPLOAD ANIIMATION CODE */

/**
* Optimizing datepicker for all timezones & setting current date as default
*/
Date.prototype.toDateInputValue = (function() {
    let local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});
document.getElementById('frmDate').value = new Date().toDateInputValue();

(function setDatepicker() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
   if(dd<10){
          dd='0'+dd
      }
      if(mm<10){
          mm='0'+mm
      }
  today = yyyy+'-'+mm+'-'+dd;
  document.getElementById('frmDate').setAttribute("min", today);
  console.log(today);
})();

/**
* Alerting users if they picked a date in the past (which is not allowed)
*/
function checkDate() {
  let selectedText = document.getElementById('frmDate').value;
  let selectedDate = new Date(selectedText);
  let now = new Date();
  if (selectedDate < now) {
    document.getElementById('frmDate').value = new Date().toDateInputValue();
    //alert("Date can not be in the past!");
    return false;
  }
  return true;

}

/* Link submit button on pop-up to the form */
function submitForm(){
  // TODO rewrite without JQUERY
  $('#meal_form').submit(function (e) {
    e.preventDefault();
    let data = getFormData().then(data => {
      postMealForm(data)
    });
  });
  $('#meal_form').submit();
}

async function getFormData() {
  return new Promise(resolve => {
    const getFormInput = () => {
      let jsoninput = {};
      if(!checkDate){
        uploadFail = true;
        errorUpload('The submitted meal is in the past! Please try again with a suitable date.');
        reject();
      }
      jsoninput.name = document.mealform.name.value.trim(); //
      jsoninput.date = document.mealform.date.value; //
      jsoninput.email = document.mealform.email.value.trim(); //
      jsoninput.meal = document.mealform.meal.value.trim(); //
      jsoninput.price = document.mealform.price.value; //
      jsoninput.spots = document.mealform.spots.value; //
      jsoninput.street = document.mealform.street.value.trim(); //
      jsoninput.housenumber = document.mealform.housenumber.value; //
      jsoninput.zip = $('#frmZip')[0].value; //
      jsoninput.city = deleteSpace(document.mealform.city.value); //
      jsoninput.diet = $('input[name="diet"]:checked')[0].value; //
      jsoninput.text = document.mealform.text.value.trim(); //
      return jsoninput
    };

    formJSON = getFormInput();
    googleCoords(formJSON.zip,formJSON.street,formJSON.housenumber).then(coords => {
      formJSON.lat = coords[0];
      formJSON.lng = coords[1];
      progressingBar();
      uploadMealImages().then(imageData => {
        formJSON.images = imageData; //
        formString = JSON.stringify(formJSON);
        console.log(formString);
        resolve(formString);
      });
    });
  });
}

//Delete any spaces in the city by a '_', subsequent spaces are reduced to one.
function deleteSpace(str) {
  let replaced = str.trim();
  if(/\s+/.test(replaced)){
    replaced = replaced.replace(/\s\s+/g, ' ').replace(/\s/g, '_');
  }
  return replaced;
}

//Converts address into latitude and longitude
function googleCoords(zip,street,housenumber){
  if (typeof google === 'object' && typeof google.maps === 'object') {
    return new Promise((resolve, reject) => {
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address': zip + " " + street + " " + housenumber}, function(results, status) {
        if (status === 'OK') {
          let coords = [];
          coords[0]=results[0].geometry.location.lat();
          coords[1]=results[0].geometry.location.lng();
          console.log(coords);
          resolve(coords);
        } else {
          uploadFail = true;
          errorUpload('The submitted location does not exist! Please try again with a location that exists.');
          reject(status);
        }
      });
    });
  } else {
    alert('Geocode could not be loaded correctly, form submission failed');
  }
}

function uploadMealImages() {
  const storageRef = firebase.storage().ref();

  const mealName = document.getElementById("frmMeal").value
                      .replace(/[^a-z0-9]/gi, '_').toLowerCase();

  let mealId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);

  const isImage = file => (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg");

  const compressImagePromise = imgFile => {
    const sizeOf = bytes => {
      if (bytes == 0) { return "0.00 B"; }
      let e = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes/Math.pow(1024, e)).toFixed(2)+' '+' KMGTP'.charAt(e)+'B';
    }

    return new Promise((resolve, reject) => {
      const originalSize = imgFile.size;
      new Compressor(imgFile, {
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
        success(result) {
          console.log("Compressed! Original size of file was: " + sizeOf(originalSize) + ", the result is: " + sizeOf(result.size)  + ". The image has been compressed to " + (100/(originalSize/result.size)).toFixed(2) + "% of its original size.");
          resolve(result);
        },
        error(err) {
          uploadFail = true;
          errorUpload('Something went wrong with compressing the provided images. Please try again later!');
          console.log(err.message);
          reject(error);
        },
      });
    });
  };

  const uploadImagePromise = (imgFile, fileBaseName, index) => {
    return new Promise(resolve => {
      const fileName = fileBaseName + (index + 1).toString();
      const getMetadata = file => {
        if (file.type === "image/png") return {contentType: 'image/png'};
        else if (file.type === "image/jpg") return {contentType: 'image/jpg'};
        else if (file.type === "image/jpeg") return {contentType: 'image/jpeg'};
        else return {contentType: 'image/other'};
      }
      const metadata = getMetadata(imgFile);
      imgFile.name = fileName;

      storageRef.child('images/' + mealId + '/' + fileName).put(imgFile, metadata).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(url) {
          updateUploadProgress();
          resolve(url);
        });
      }).catch(function(error) {
        uploadFail = true;
        errorUpload('Something went wrong when submitting the meal. Please try again later!');
        console.error('Upload failed:', error);
      });
    });
  };

  return new Promise(resolve => {
    let fileList = imgUploadFiles;

    let compressImagePromises = Object
      .values(fileList)
      .filter(file => isImage(file))
      .map((imgFile) => compressImagePromise(imgFile));

    Promise.all(compressImagePromises).then(compressedImgFiles => { //AFTER all images are compressed, execute this
      console.log(compressedImgFiles);
      let imageUploadPromises = compressedImgFiles.map((imgFile, index) => uploadImagePromise(imgFile, mealName, index));
      return Promise.all(imageUploadPromises);
    }).then(locUrls => resolve(locUrls))
    .catch(function(error){
      uploadFail = true;
      errorUpload('Something went wrong with compressing the provided images. Please try again later!');
      console.error(error);
    });
  });
}

function postMealForm(content) {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         // Typical action to be performed when the document is ready:
         console.log(xhttp.responseText); //server response
         generateLink(xhttp.responseText);
      }
  };
  xhttp.open("POST", 'https://us-central1-picobellyapp.cloudfunctions.net/postListingV3', true);
  xhttp.setRequestHeader("Content-Type", "text/plain");
  xhttp.send(content);
  return xhttp.responseText;
}

function showPopup(id) { //show the first content in pop-up window of the upload progress
  let curelem = document.getElementsByClassName('active-popup');
  for(let i = 0; i < curelem.length; i++){
    curelem[i].style.display = "none";
    curelem[i].classList.remove("active-popup");
  }
  let elem = document.getElementById(id);
  elem.classList.add("active-popup");
  if (elem.style.display === "none") {
    elem.style.display = "block";
  } else {
    elem.style.display = "none";
  }
}

function errorUpload(msg = "Oh no, something went wrong! Please update your form submission.") { //show when process fails
  let curelem = document.getElementsByClassName('active-popup');
  for(let i = 0; i < curelem.length; i++){
    curelem[i].style.display = "none";
    curelem[i].classList.remove("active-popup");
  }
  let errelem = document.getElementById("error-popup");
  errelem.classList.add("active-popup");
  if (errelem.style.display === "none") {
    errelem.style.display = "block";
  } else {
    errelem.style.display = "none";
  }
  let errorP = document.getElementById('error-msg');
  errorP.innerHTML = msg;
}

function generateLink(key){
  var elem = document.getElementById("butCheckout");
  // TODO FIX DEZE FUNCTIE IS SLORDIG MET KEY GEVEN MAAR EEN OBJECT PASSEN
  keyjson = JSON.parse(key)
  let postkey = keyjson.mealId;
  let mealURL = 'https://picobelly.com/meal?loc='+ deleteSpace(document.mealform.city.value);
  mealURL = addUrlParam(mealURL,'id',postkey);
  //mealURL = encodeURIComponent(mealURL);
  $('#share-url').attr('value', mealURL);
  elem.setAttribute('onclick',"window.location.href='" + mealURL + "'");
}
