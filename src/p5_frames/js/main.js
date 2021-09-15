import p5 from "p5";
import bg from "../img/bg.jpeg";

const sketch = (p) => {
  let img, c, blendModes, blendModeIterator, frameSize, resizeWidth, resizeHeight, maskPosWidth, maskPosHeight, webcamMode, capture, maskImage, rotation = 0;

  /*
  TODO:
  create modal window with commands that can be Closed
  create ASCII filter for the canvas
  Make bg image fit the screen properly on mobile
  */

  p.setup = () => {
    img = p.loadImage(bg, _img => {
      p.image(_img, p.width/2, p.height/2, p.width, p.height);
    });

    p.createCanvas(p.windowWidth, p.windowHeight);
    p.imageMode(p.CENTER);
    p.image(img, p.width/2, p.height/2, p.width, p.height);
    webcamMode = false;
    maskImage = p.createGraphics(p.width,p.height);
    blendModes = [p.BLEND, p.DARKEST, p.LIGHTEST, p.DIFFERENCE, p.OVERLAY, p.HARD_LIGHT, p.SOFT_LIGHT, p.DODGE, p.BURN, p.ADD];
    blendModeIterator = 0;
    iterateBlendMode();

    //frame gets divided by 'frameSize' to determine size of next frame
    frameSize = 1.3;
    redrawFrameSizeParams(frameSize);
  }

  p.draw = () => {
    p.translate(p.width / 2, p.height / 2);
    p.rotate(rotation);
    p.translate(-p.width / 2, -p.height / 2);
    if(webcamMode) {
      drawMask();
      p.image(capture, p.width/2, p.height/2, p.width, p.height);
      // rotate(-2);
      // blendMode(BLEND);
    }
    drawImage();
  }

  function redrawFrameSizeParams(_frameSize = frameSize){
    //Precalculates values based on frameSize to save computation time
    //resizeWidth and resizeHeight are the dimensions of the drawn frame
    resizeWidth = p.width / frameSize;
    resizeHeight = p.height / frameSize;
    //maskPosWidth and maskPosHeight are used to calculate the position of the mask
    maskPosWidth = p.width/(frameSize*2);
    maskPosHeight = p.height/(frameSize*2);
  }

  function drawMask(){
    // create mask
    maskImage.rect(0,0,p.width, p.height);
    maskImage.erase();
    maskImage.rect(p.mouseX-maskPosWidth,p.mouseY-maskPosHeight,resizeWidth,resizeHeight);
    maskImage.noErase();
    capture.mask(maskImage);
  }

  function drawImage(){
    c = p.get();
    c.resize(resizeWidth, resizeHeight);
    c.set();
    c.updatePixels();
    p.image(c, p.mouseX, p.mouseY);
  }

  p.mouseWheel = (event) => {
    frameSize -= event.delta/500;
    if(frameSize < 1) {
      frameSize = 1;
    }
    p.print("DAYUM DAWG, YOU BE DIVIDIN' Y'ALL FRAME BY " + frameSize + "!");
    redrawFrameSizeParams();
    //uncomment to block page scrolling
    return false;
  }

  let oldMouseX = 0;

  p.mousePressed = () => {
    oldMouseX = p.mouseX;
  }

  p.mouseDragged = () => {
    rotation += (oldMouseX - p.mouseX) / 100;
    oldMouseX = p.mouseX;
  }

  function setRandomBackground(){
    img = p.loadImage('https://picsum.photos/' + p.width + '/' + p.height, _img => {
      p.blendMode(blendModes[0]);
      p.image(_img, p.width/2, p.height/2, p.width, p.height);
    });
  }

  function refreshBackground(){
    p.blendMode(blendModes[0]);
    if(webcamMode) {
      p.image(capture, p.width/2, p.height/2, p.width, p.height);
    } else {
      p.image(img, p.width/2, p.height/2, p.width);
    }
  }

  function toggleWebcamMode(){
    if(!webcamMode){
      capture = p.createCapture(p.VIDEO);
      capture.size(p.width, p.height);
    } else {
      capture.remove();
    }
    webcamMode = !webcamMode;
  }

  function iterateBlendMode(){
    if(blendModeIterator>blendModes.length-1) {
      blendModeIterator = 0;
    }
    p.blendMode(blendModes[blendModeIterator]);
    blendModeIterator++;
  }

  p.keyTyped = () => {
    if (p.key==='m') {
      p.print("BLENDMODE CHANGE! " + blendModes[blendModeIterator]);
      iterateBlendMode();
    } else if (p.key==="r") {
      p.print('REFRESH!');
      refreshBackground();
    } else if (p.key === "p") {
      p.print("CHANGE MY PICTURE!");
      setRandomBackground();
    } else if (p.key === "c") {
      p.print("TOGGLE WEBCAM MODE!");
      toggleWebcamMode();
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    redrawFrameSizeParams();
    if(!webcamMode)
      setRandomBackground();
  }
}

const sketchInstance = new p5(sketch);

