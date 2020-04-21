let img, c, blendModes, blendModeIterator, frameSize, resizeWidth, resizeHeight, maskPosWidth, maskPosHeight, webcamMode, capture, maskImage;

/*
TODO:
create modal window with commands that can be Closed
create ASCII filter for the canvas
Make bg image fit the screen properly on mobile
*/

function preload(){
  img = loadImage('./img/bg.jpeg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  image(img, width/2, height/2, width, height);
  webcamMode = false;
  maskImage = createGraphics(width,height);
  blendModes = [BLEND, DARKEST, LIGHTEST, DIFFERENCE, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, BURN, ADD];
  blendModeIterator = 0;

  //frame gets divided by 'frameSize' to determine size of next frame
  frameSize = 1.3;
  redrawFrameSizeParams(frameSize);
}

function draw(){
  if(webcamMode) {
    drawMask();
    image(capture, width/2, height/2, width, height);
  }
  drawImage();
}

function redrawFrameSizeParams(_frameSize = frameSize){
  //Precalculates values based on frameSize to save computation time
  //resizeWidth and resizeHeight are the dimensions of the drawn frame
  resizeWidth = width / frameSize;
  resizeHeight = height / frameSize;
  //maskPosWidth and maskPosHeight are used to calculate the position of the mask
  maskPosWidth = width/(frameSize*2);
  maskPosHeight = height/(frameSize*2);
}

function drawMask(){
  // create mask
  maskImage.rect(0,0,width, height);
  maskImage.erase();
  maskImage.rect(mouseX-maskPosWidth,mouseY-maskPosHeight,resizeWidth,resizeHeight);
  maskImage.noErase();
  capture.mask(maskImage);
}

function drawImage(){
  c = get();
  c.resize(resizeWidth, resizeHeight);
  c.set();
  c.updatePixels();
  image(c, mouseX, mouseY);
}

function mouseWheel(event) {
  frameSize -= event.delta/500;
  if(frameSize < 0.9) {
    frameSize = 0.9;
  }
  print("DAYUM DAWG, YOU BE DIVIDIN' Y'ALL FRAME BY " + frameSize + "!");
  redrawFrameSizeParams();
  //uncomment to block page scrolling
  return false;
}

function setRandomBackground(){
  img = loadImage('https://picsum.photos/' + width + '/' + height, _img => {
    blendMode(blendModes[0]);
    image(_img, width/2, height/2, width, height);
  });
}

function refreshBackground(){
  blendMode(blendModes[0]);
  if(webcamMode) {
    image(capture, width/2, height/2, width, height);
  } else {
    image(img, width/2, height/2, width);
  }
  blendMode(blendModes[blendModeIterator]);
}

function toggleWebcamMode(){
  if(!webcamMode){
    capture = createCapture(VIDEO);
    capture.size(width, height);
  } else {
    capture.remove();
  }
  webcamMode = !webcamMode;
}

function iterateBlendMode(){
  blendModeIterator++;
  if(blendModeIterator>blendModes.length-1) {
    blendModeIterator = 0;
  }
  blendMode(blendModes[blendModeIterator]);
}

function keyTyped() {
  if (key==='m') {
    print("BLENDMODE CHANGE! " + blendModes[blendModeIterator]);
    iterateBlendMode();
  } else if (key==="r") {
    print('REFRESH!');
    refreshBackground();
  } else if (key === "p") {
    print("CHANGE MY PICTURE!");
    setRandomBackground();
  } else if (key === "c") {
    print("TOGGLE WEBCAM MODE!");
    toggleWebcamMode();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redrawFrameSizeParams();
  if(!webcamMode)
    setRandomBackground();
}
