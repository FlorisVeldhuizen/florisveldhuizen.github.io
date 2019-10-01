/**
* Add a URL parameter (or changing it if it already exists)
* @param {search} string  this is typically document.location.search
* @param {key}    string  the key to set
* @param {val}    string  value
*/
var addUrlParam = function(search, key, val){
  var newParam = key + '=' + val,
      params = '?' + newParam;
  // If the "search" string exists, then build params from it
  if (search) {
    // Try to replace an existance instance
    params = search.replace(new RegExp('([?&])' + key + '[^&]*'), '$1' + newParam);

    // If nothing was replaced, then add the new param to the end
    if (params === search) {
      params += '&' + newParam;
    }
  }
  return params;
};

/**
* Image upload functions
*/
let imgUploadFiles = []; // Array with all image files ready for uploading
let fileCounter = 0; //used to count the total number of items in imgUploadFiles, without requiring .length
const reader  = new FileReader();
const overlaydiv = '<div class="overlaydiv"><div class="overlaytext"> Remove? </div></div>'; // Div that appears when hovering over preview images
const maxFileN = 5; //Max number of pictures that can be uploaded

const labelpreview = () => { // Adds label for clarity when images are added to the form
  const previewLabel = document.getElementById('preview-label');
  if (fileCounter < 1) previewLabel.style.display = "none";
  else previewLabel.style.display = "inline";
}

function removeFile(elem){ // Removes image from imgUploadFiles and the image preview list
  const parent = document.getElementById('preview-list');
  const parentArray = Array.from(parent.children);
  const index = parentArray.indexOf(elem);
  imgUploadFiles.splice(index, 1);
  parent.removeChild(elem);
  fileCounter--;
  labelpreview();
}

function dataURItoBlob(dataURI) { //used to make the uploaded images into files, so they can be compressed later
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);
  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  // create a view into the buffer
  var ia = new Uint8Array(ab);
  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;
}

function previewFile(){ //main function, shows added files in the form and fills imgUploadFiles with the selected files
   const file    = document.getElementById('meal_photos').files; // Get fileList of images
   const isImage = file => {
     if(file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg"){
       return true;
     } else {
       window.alert("Error: \"" + file.name + "\" is not a supported image file, please try another file type (like .png, .jpg or .jpeg)!");
       return false;
     }
   }
   const imgUploadFileCap = amount => {
     if(fileCounter > amount - 1) {
       window.alert("You can only upload a maximum of " + amount + " pictures with your meal!");
       return true;
     } else return false;
   }

   if (file) {
     for(let i = 0, p = Promise.resolve(); i<file.length; i++){ // For loop that resolves a Promise every loop
       if(imgUploadFileCap(maxFileN)){ //Check if there are too many pictures in the imgUploadFile.
         return;
       } else if(isImage(file[i])){ // Checks per uploaded file if it is an image
         fileCounter++;
         p = p.then(() => new Promise(resolve => { // Then creates a new promise
           reader.readAsDataURL(file[i]); //reads the data as a URL
           reader.onloadend = function(){
             const blobFile = dataURItoBlob(reader.result);
             imgUploadFiles.push(blobFile);
             labelpreview();
             const imgpreview = '<img src="' + reader.result + '" alt="Image preview...">';
             $('#preview-list').append('<li class="col-xs-6" onclick="removeFile(this)">' + imgpreview + overlaydiv + '</li>');
             resolve(blobFile);
           }
         }));
       }
     }
   } else {
     console.error("Error uploading file, please try again...");
   }
}

// $('#test').click(function (e) {
//    console.log(addUrlParam('localhost/pikobellie/meal?loc=Enschede','id',responseKey)); //redirecting page
// });
