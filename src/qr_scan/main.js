import jsQR from "jsqr";

let canvasElement, canvas, video;
let front = false;

// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function(constraints) {

    // First get ahold of the legacy getUserMedia, if present
    let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
}

function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
  }

let runCam = function(){
  navigator.mediaDevices.getUserMedia({ video: { facingMode: (front? "user" : "environment"), width: 1280, height: 720 } })
  .then(function(stream) {
    // Older browsers may not have srcObject
    if ("srcObject" in video) {
      video.srcObject = stream;
    } else {
      // Avoid using this in new browsers, as it is going away.
      video.src = window.URL.createObjectURL(stream);
    }
    video.onloadedmetadata = function(e) {
      video.setAttribute('playsinline', true);
      video.play();
      requestAnimationFrame(tick);
    };
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  });
}

function tick() {
  canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
  let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
  let code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });
  if(code){
    drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
    drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
    drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
    drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
  }
  requestAnimationFrame(tick);
}

window.onload = function(){
  video = document.querySelector('video');
  canvasElement = document.getElementById("canvas");
  canvas = canvasElement.getContext("2d");
  runCam();
  document.getElementById('flip-button').onclick = function() {
    front = !front;
    runCam();
  };
};
