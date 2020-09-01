// PARAMS
const fieldWidth = 400;
const fieldHeight = 400;
const backgroundColor = 255;
const gridResolutionX = 14;   // How many squares fit in a row  (default: 14)
const gameSpeed = 13;         // Amount of frames per second    (default: 12)
const snakeSize = 5;

// PRECALCULATED VALUES
let fieldOffsetX, fieldOffsetY, squareSize, gridResolutionY; 

// TOUCH CONTROLS
let startTouchX, startTouchY;
let touchControl = false;     // If true, the touch controls are displayed on screen
let touchSet = false;         // If true, the touch controls highlight the current direction
const arcSize = 120;          // Diameter of the touch controls

// GLOBAL VARIABLES
const _RIGHT = 0;
const _DOWN  = 1;
const _LEFT  = 2;
const _UP    = 3;

let direction = _RIGHT; 
let curLocation = [0,0];
let bodyParts = [];
let bodyLength = snakeSize - 1;
let directionLocked = false;
let death = false;
let iterationCounter = 0;
let snaccPos = [0,0];
let _frameRate = 60 / gameSpeed;
let highScore = 0;


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0,0,0,100);
  fieldOffsetX = (windowWidth/2)-(fieldWidth/2);
  fieldOffsetY = (windowHeight/2)-(fieldHeight/2);
  squareSize = fieldWidth / gridResolutionX;
  gridResolutionY = Math.floor(fieldHeight / squareSize);
  spawnSnacc();
}

function draw() {
  if (touchControl) calcTouch();
  if (iterationCounter > _frameRate) {
    background(0,0,0,100);
    calcNewPos();
    drawGrid();
    drawPlayer();
    drawSnacc();
    iterationCounter = 0;
  }
  if (touchControl) drawTouch();
  if (death) reset();
  iterationCounter++;
  drawScore();
}

const reset = () => {
  fill(255);
  rect(0,0,windowWidth,windowHeight);
  background(0,0,0,100);
  bodyLength = snakeSize - 1;
  bodyParts = [];
  death = false;
  shaky = true;
  _frameRate = 60 / gameSpeed;
}

const drawGrid = () => {
  stroke(255)
  fill(0);
  for (let i = 0; i < gridResolutionX; i++) { // x-axis
    for (let j = 0; j < gridResolutionY; j++) { // y-axis
      rect(i * squareSize + fieldOffsetX, j * squareSize + fieldOffsetY, squareSize, squareSize);
    }
  }
}

const drawScore = () => {
  const fontSize = 30;
  const curScore = bodyLength - (snakeSize - 1);
  if(curScore > highScore) highScore = curScore;
  textSize(fontSize);
  fill(255)
  // Highscore
  textAlign(RIGHT);
  text(`${String.fromCodePoint(0x1F3C6)}: ${highScore}`, fieldOffsetX + fieldWidth, fieldOffsetY - fontSize);
  // Current score
  textAlign(LEFT);
  text(`${String.fromCodePoint(0x1F36C)}: ${curScore}`, fieldOffsetX, fieldOffsetY - fontSize);
}

const spawnSnacc = () => {
  const xPos = Math.floor(Math.random() * gridResolutionX);
  const yPos = Math.floor(Math.random() * gridResolutionY);
  let overlap = false;

  bodyParts.forEach(part => {
    if (part[0] === xPos && part[1] === yPos) {
      overlap = true;
    }
  });

  if (overlap) return spawnSnacc();
  else return snaccPos = [xPos,yPos];
}

const drawSnacc = () => {
  textSize(32);
  text(`${String.fromCodePoint(0x1F36C)}`, snaccPos[0] * squareSize + fieldOffsetX, (snaccPos[1] + 0.9) * squareSize + fieldOffsetY);
}

const calcNewPos = () => {
  // Calculate new position of body based on direction
  if      (direction === _UP)    { curLocation[1]--; }
  else if (direction === _DOWN)  { curLocation[1]++; }
  else if (direction === _LEFT)  { curLocation[0]--; }
  else if (direction === _RIGHT) { curLocation[0]++; }

  // Boundary check
  if      (curLocation[1] < 0 ) { curLocation[1] = gridResolutionY - 1; }
  else if (curLocation[1] > gridResolutionY - 1 ) { curLocation[1] = 0; }
  else if (curLocation[0] < 0 ) { curLocation[0] = gridResolutionX - 1; }
  else if (curLocation[0] > gridResolutionX - 1 ) { curLocation[0] = 0; }

  // Shift the snake body
  if (bodyParts.length > bodyLength) { bodyParts.shift(); }

  // Death 💀 and Snacc 🍬 check 
  bodyParts.forEach(part => {
    if (curLocation[0] === part[0] && curLocation[1] === part[1]) {
      death = true;
      console.error(`U DEAD ${String.fromCodePoint(0x1F480)}`);
    }
  });

  if (curLocation[0] === snaccPos[0] && curLocation[1] === snaccPos[1]) {
    bodyLength++
    spawnSnacc();
  }
  
  // Set all bodyparts
  bodyParts.push([...curLocation]);

  // Allow new keyboard input
  directionLocked = false;
}

const drawPlayer = () => {
  const colorInterval = Math.floor(155 / bodyLength);
  bodyParts.forEach((part,index) => {
    fill(index * colorInterval + 100,0,0);
    rect(part[0] * squareSize + fieldOffsetX, part[1] * squareSize + fieldOffsetY, squareSize, squareSize);
  });
}

const calcTouch = () => {
  const distSquared = (x1, y1, x2, y2) => {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return dx * dx + dy * dy;
  }
  const dirCheck = (oppositeDir, dir) => {
    if (direction !== oppositeDir) {
      if (!directionLocked) direction = dir;
    } 
    else touchSet = false;
  }
  let radianDistance = Math.atan2(mouseY-startTouchY, mouseX-startTouchX);
  if (radianDistance < 0) radianDistance = radianDistance + TWO_PI;

  if(distSquared(startTouchX, startTouchY, mouseX, mouseY) > 100) {
    touchSet = true;
    if (radianDistance > TWO_PI - QUARTER_PI || radianDistance < QUARTER_PI) {
      dirCheck(_LEFT,_RIGHT);
    }
    else if (radianDistance > QUARTER_PI && radianDistance < HALF_PI + QUARTER_PI) {
      dirCheck(_UP,_DOWN);
    }
    else if (radianDistance > HALF_PI + QUARTER_PI && radianDistance < PI + QUARTER_PI) {
      dirCheck(_RIGHT,_LEFT);
    }
    else if (radianDistance > PI + QUARTER_PI && radianDistance < TWO_PI - QUARTER_PI) {
      dirCheck(_DOWN,_UP);
    }
    directionLocked = touchSet;
  } else {
    touchSet = false;
  }
}

const drawTouch = () => {
  const bottomArc = () => arc(startTouchX, startTouchY, arcSize, arcSize, QUARTER_PI, HALF_PI + QUARTER_PI);
  const leftArc = () => arc(startTouchX, startTouchY, arcSize, arcSize, HALF_PI + QUARTER_PI, PI + QUARTER_PI);
  const topArc = () => arc(startTouchX, startTouchY, arcSize, arcSize, PI + QUARTER_PI, TWO_PI - QUARTER_PI);
  const rightArc = () => arc(startTouchX, startTouchY, arcSize, arcSize, TWO_PI - QUARTER_PI, QUARTER_PI);

  fill(100);
  ellipse(startTouchX, startTouchY, arcSize, arcSize);
  if(touchSet) {
    fill(200);
    if      (direction === _UP) topArc();
    else if (direction === _DOWN) bottomArc();
    else if (direction === _LEFT) leftArc();
    else if (direction === _RIGHT) rightArc();
  }

  // TO-DO: DRAW JOYSTICK THAT IS constrained BY BOUNDARIES OF CONTROL
  fill(50);
  ellipse(mouseX, mouseY, arcSize/2, arcSize/2);
}

function mousePressed () {
  startTouchX = mouseX;
  startTouchY = mouseY;
  touchControl = true;
  // prevent default
  return false;
}

function mouseReleased() {
  touchControl = false;
  // prevent default
  return false;
}

function touchStarted () {
  startTouchX = mouseX;
  startTouchY = mouseY;
  touchControl = true;
  // prevent default
  return false;
}

function touchEnded() {
  touchControl = false;
  // prevent default
  return false;
}

const handleKeys = (keyType, up, down, left, right) => {
  const setDirection = dir => {
    direction = dir;
    directionLocked = true;
  }
  if (!directionLocked) { //prevents a player to abuse pressing multiple directions to turn directly
    if      (keyType === up)    { if (direction !== _DOWN) setDirection(_UP);   } 
    else if (keyType === down)  { if (direction !== _UP)   setDirection(_DOWN); }
    else if (keyType === left)  { if (direction !== _RIGHT)setDirection(_LEFT); }
    else if (keyType === right) { if (direction !== _LEFT) setDirection(_RIGHT);}
  }
}

function keyTyped() {
  handleKeys(key, "w", "s", "a", "d");
}

function keyPressed() {
  handleKeys(keyCode, UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0,0,0,100);
  fieldOffsetX = (windowWidth/2)-(fieldWidth/2);
  fieldOffsetY = (windowHeight/2)-(fieldHeight/2);
  squareSize = fieldWidth / gridResolutionX;
}
