/*
Cadeautje voor mama
Met dank aan: https://www.openprocessing.org/sketch/532445 (sketch van Justin Chambers)
*/

let sunSize, sunHeight, halfCanvas, reflectionHalfWidth, reflectionColor, highlightColor, waterLowColor, waterHighColor;

let gradientSteps = 20; //the detail of color
let noiseScale = .07; //increments the noise, higher values are more erratic
let waveMovementSpeed = 1.75; //how noisy is the water
let waterStrokeWeight = 10; //how thicc is the water
let waterStride = 15; //the lower, the more detailed

function preload(){
  img = loadImage('./img/gazing.png');
}

function setup(){
  const canvasElement = createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  strokeCap(SQUARE);
  noSmooth();
  halfCanvas = width/2;
  sunSize = width/6;
  reflectionHalfWidth = sunSize;
  sunHeight = height/3;

  drawSun();

  //set reflection colors
  reflectionColor = color(240, 125, 125);
  highlightColor = color(240, 240, 175);
  waterLowColor = color(0, 12, 31);
  waterHighColor = color(100, 110, 130);
}

function draw(){
  let lineToggle = 0;
  const noiseZInput = frameCount/100*waveMovementSpeed;

  for(let yPos = sunHeight + waterStrokeWeight ; yPos < height + waterStrokeWeight; yPos += waterStrokeWeight){
    const yPosMap01 = map(yPos, sunHeight, height, 0, 1); //maps the yPos on a scale of 0 to 1, looking at the complete range of possible yPos
    const noiseYInput = noiseScale*(yPos*map(yPos, sunHeight, height, 1.5, 1) -frameCount/2)*waveMovementSpeed;
    const reflectionCone = reflectionHalfWidth*(yPosMap01 +.6); //alternative cone value: reflectionHalfWidth*(1.5*(2-yPosMap01)*yPosMap01 + .7);

    for(let xPos = lineToggle; xPos <= width-lineToggle; xPos += waterStride){
      const noiseXInput = noiseScale*((xPos -(1 -yPosMap01)*height/4) +waterStride*.5)/(yPosMap01*10 +1);
      const noiseVal = noise(noiseXInput, noiseYInput, noiseZInput);
      const noiseValIncreasedContrast = constrain(map(noiseVal, .1, .6, 0, 1), 0, 1);
      const edgeBlendModifier = constrain((2 -(abs(halfCanvas -xPos +lineToggle)/reflectionCone)*2), 0, 1);

      let c = lerpColor(waterLowColor, waterHighColor, noiseVal);
      c = lerpColor(c, reflectionColor, constrain(noiseValIncreasedContrast*4 -3, 0, edgeBlendModifier));
      c = lerpColor(c, highlightColor, constrain((noiseVal*10 -6), 0, edgeBlendModifier) + pow(1 -yPosMap01, 8)*edgeBlendModifier*1.5);
      c = lerpColor(c, highlightColor, constrain((noiseVal*10 -7), 0, 1));

      stroke(c);
      line(xPos, yPos, xPos + waterStride, yPos);
    }
    lineToggle = lineToggle == 0 ? -waterStride/3 : 0;
  }
  image(img, width/2, height/2, width, height);
}

function drawSun(){
  noStroke();
  // sky background
  fill(103, 210, 239);
  rect(0, 0, width, height);

  // sky burst
  let from = color(103, 210, 239);
  let to = color(255, 243, 203);
  for(let i=gradientSteps; i>0; --i){
    const size = map(i, gradientSteps, 0, width +50, halfCanvas);
    fill(lerpColor(from, to, 1 -i/gradientSteps));
    ellipse(halfCanvas, sunHeight, size, size);
  }

  // horizon fades
  from = color(255, 229, 165, 30);
  to = color(255, 30);
  for(let i=gradientSteps; i>0; --i){
    const sizeX = map(i, gradientSteps, 0, width, halfCanvas);
    const sizeY = map(i, gradientSteps, 0, height*.3, 20);
    const posOffset = map(i, gradientSteps, 0, halfCanvas, halfCanvas +50);
    fill(lerpColor(from, to, 1 -i/gradientSteps));
    ellipse(width/2 -posOffset, sunHeight, sizeX, sizeY);
    ellipse(width/2 +posOffset, sunHeight, sizeX, sizeY);
  }

  // sun
  from = color(255, 217, 135);
  to = color(255);
  for(let i=gradientSteps; i>0; --i){
    const size = map(i, gradientSteps, 0, sunSize, 0);
    fill(lerpColor(from, to, 1 -i/gradientSteps));
    ellipse(halfCanvas, sunHeight, size, size);
  }

  strokeWeight(waterStrokeWeight);
}

let oldMouseY = 0;

function mousePressed() {
  oldMouseY = mouseY;
}

function mouseDragged() {
  sunHeight -= (oldMouseY - mouseY);
  oldMouseY = mouseY;
  drawSun();
}

function windowResized() {
  setup();
}
