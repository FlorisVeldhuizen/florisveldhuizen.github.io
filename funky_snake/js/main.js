/* 
Made by: Floris Veldhuizen
Queuing of moves was adapted from: https://github.com/patorjk/JavaScript-Snake/blob/master/js/snake.js 
*/

// PARAMS
const fieldWidth = 400;
const fieldHeight = 400;
const backgroundColor = 255;
const gridResX = 14;   // How many squares fit in a row  (default: 14)
const gameSpeed = 13;         // Amount of frames per second    (default: 12)
const snakeSize = 5;

// GLOBAL VARIABLES
const NIL     = -1;
const _RIGHT  = 0;
const _DOWN   = 1;
const _LEFT   = 2;
const _UP     = 3;

// PRECALCULATED VALUES
let fieldOffsetX, fieldOffsetY, squareSize, gridResY, maxLength, lastDir; 

// TOUCH CONTROLS
let startTouchX, startTouchY;
let touchControl = false;     // If true, the touch controls are displayed on screen
let touchDir = NIL;
const arcSize = 120;          // Diameter of the touch controls

let isFirstMove = true;
let preMove = NIL;
let curDir = _RIGHT;
let curLoc = [0,0];
let bodyParts = [];
let bodyLength = snakeSize - 1;
let death = false;
let iterationCounter = 0;
let snaccPos = [0,0];
let _frameRate = Math.floor(60 / gameSpeed); // Assuming 60 fps
let highScore = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0,0,0,100);
  fieldOffsetX = (windowWidth/2)-(fieldWidth/2);
  fieldOffsetY = (windowHeight/2)-(fieldHeight/2);
  squareSize = fieldWidth / gridResX;
  gridResY = Math.floor(fieldHeight / squareSize);
  maxLength = gridResX * gridResY;
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
}

const drawGrid = () => {
  stroke(255)
  fill(0);
  for (let i = 0; i < gridResX; i++) { // x-axis
    for (let j = 0; j < gridResY; j++) { // y-axis
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
  const xPos = Math.floor(Math.random() * gridResX);
  const yPos = Math.floor(Math.random() * gridResY);
  let overlap = false;

  // TO-DO check for bodyparts, then spawn snacc somewhere where there is no bodypart
  // TO-DO: use maxLength to determine when the game is over

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
  // Set lastDir and check for queued moves
  lastDir = curDir;
  if (preMove !== NIL) {
    curDir = preMove;
    preMove = NIL;
  }
  isFirstMove = true;

  // Calculate new position of body based on direction
  if      (lastDir === _UP)    { curLoc[1]-- }
  else if (lastDir === _DOWN)  { curLoc[1]++ }
  else if (lastDir === _LEFT)  { curLoc[0]-- }
  else if (lastDir === _RIGHT) { curLoc[0]++ }

  // Boundary check
  if      (curLoc[1] < 0 ) { curLoc[1] = gridResY - 1 }
  else if (curLoc[1] > gridResY - 1 ) { curLoc[1] = 0 }
  else if (curLoc[0] < 0 ) { curLoc[0] = gridResX - 1 }
  else if (curLoc[0] > gridResX - 1 ) { curLoc[0] = 0 }

  // Shift the snake body
  if (bodyParts.length > bodyLength) { bodyParts.shift(); }

  // Death 💀 and Snacc 🍬 check 
  bodyParts.forEach(part => {
    if (curLoc[0] === part[0] && curLoc[1] === part[1]) {
      death = true;
      console.error(`U DEAD ${String.fromCodePoint(0x1F480)}`);
    }
  });

  if (curLoc[0] === snaccPos[0] && curLoc[1] === snaccPos[1]) {
    bodyLength++;
    spawnSnacc();
  }

  // Set all bodyparts
  bodyParts.push([...curLoc]);
}

const drawPlayer = () => {
  const colorInterval = Math.floor(155 / bodyLength);
  bodyParts.forEach((part,index) => {
    fill(index * colorInterval + 100,0,0);
    rect(part[0] * squareSize + fieldOffsetX, part[1] * squareSize + fieldOffsetY, squareSize, squareSize);
  });
}

const setDirection = dir => {
  if (curDir !== lastDir) { preMove = dir }
  if (Math.abs(dir - lastDir) !== 2 && isFirstMove) {
    curDir = dir;
    isFirstMove = false;
  }
  touchDir = dir;
}

const calcTouch = () => {
  const distSquared = (x1, y1, x2, y2) => {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return dx * dx + dy * dy;
  }
  let radianDistance = Math.atan2(mouseY-startTouchY, mouseX-startTouchX);
  if (radianDistance < 0) radianDistance = radianDistance + TWO_PI;
  if(distSquared(startTouchX, startTouchY, mouseX, mouseY) > 100) {
    if      (radianDistance > TWO_PI - QUARTER_PI || radianDistance < QUARTER_PI)       { setDirection(_RIGHT)}
    else if (radianDistance > QUARTER_PI && radianDistance < HALF_PI + QUARTER_PI)      { setDirection(_DOWN) }
    else if (radianDistance > HALF_PI + QUARTER_PI && radianDistance < PI + QUARTER_PI) { setDirection(_LEFT) }
    else if (radianDistance > PI + QUARTER_PI && radianDistance < TWO_PI - QUARTER_PI)  { setDirection(_UP)   }
  } else {
    touchDir = NIL;
  }
}

const drawTouch = () => {
  const bottomArc = () => arc(startTouchX, startTouchY, arcSize, arcSize, QUARTER_PI, HALF_PI + QUARTER_PI);
  const leftArc   = () => arc(startTouchX, startTouchY, arcSize, arcSize, HALF_PI + QUARTER_PI, PI + QUARTER_PI);
  const topArc    = () => arc(startTouchX, startTouchY, arcSize, arcSize, PI + QUARTER_PI, TWO_PI - QUARTER_PI);
  const rightArc  = () => arc(startTouchX, startTouchY, arcSize, arcSize, TWO_PI - QUARTER_PI, QUARTER_PI);

  fill(100);
  ellipse(startTouchX, startTouchY, arcSize, arcSize);
  fill(200);
  if (touchDir === _UP)    topArc();
  if (touchDir === _DOWN)  bottomArc();
  if (touchDir === _LEFT)  leftArc();
  if (touchDir === _RIGHT) rightArc();

  // TO-DO: DRAW JOYSTICK THAT IS constrained BY BOUNDARIES OF CONTROL
  fill(50);
  ellipse(mouseX, mouseY, arcSize/2, arcSize/2);
}

const handleTouchEnd = () => {
  touchControl = false;
  return false;
}

const handleTouchBegin = () => {
  startTouchX = mouseX;
  startTouchY = mouseY;
  touchControl = true;
  return false;
}

const handleKeys = (keyType, up, down, left, right) => {
  if (keyType === right) { setDirection(_RIGHT)}
  if (keyType === down)  { setDirection(_DOWN) }
  if (keyType === left)  { setDirection(_LEFT) }
  if (keyType === up)    { setDirection(_UP)   } 
}

function mousePressed() {
  return handleTouchBegin();
}

function touchStarted() {
  return handleTouchBegin();
}

function mouseReleased() {
  return handleTouchEnd();
}

function touchEnded() {
  return handleTouchEnd();
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
  squareSize = fieldWidth / gridResX;
}
