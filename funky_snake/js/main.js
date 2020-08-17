// PARAMS
const fieldWidth = 400;
const fieldHeight = 400;
const backgroundColor = 255;
const gridResolutionX = 14;   // How many squares fit in a row  (default: 14)
const gameSpeed = 12;         // Amount of frames per second    (default: 10)
const snakeSize = 5;

// PRECALCULATED VALUES
let fieldOffsetX, fieldOffsetY, squareSize, gridResolutionY; 

// GLOBAL VARIABLES
const RIGHT = 0;
const DOWN  = 1;
const LEFT  = 2;
const UP    = 3;

let direction = RIGHT; 
let curLocation = [0,0];
let bodyParts = [];
let bodyLength = snakeSize - 1;
let directionLocked = false;
let death = false;
let snaccPos = [0,0];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0,0,0,100);
  frameRate(gameSpeed);
  textSize(32);
  fieldOffsetX = (windowWidth/2)-(fieldWidth/2);
  fieldOffsetY = (windowHeight/2)-(fieldHeight/2);
  squareSize = fieldWidth / gridResolutionX;
  gridResolutionY = Math.floor(fieldHeight / squareSize);
  spawnSnacc();
}

function draw() {
  calcNewPos();
  drawGrid();
  drawPlayer();
  drawSnacc();
  if (death) reset();
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
  for (let i = 0; i < gridResolutionX; i++) { // x-axis
    for (let j = 0; j < gridResolutionY; j++) { // y-axis
      rect(i * squareSize + fieldOffsetX, j * squareSize + fieldOffsetY, squareSize, squareSize);
    }
  }
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
  text(`${String.fromCodePoint(0x1F36C)}`, snaccPos[0] * squareSize + fieldOffsetX, (snaccPos[1] + 0.9) * squareSize + fieldOffsetY);
}

const calcNewPos = () => {
  // Calculate new position of body based on direction
  if      (direction === UP)    { curLocation[1]--; }
  else if (direction === DOWN)  { curLocation[1]++; }
  else if (direction === LEFT)  { curLocation[0]--; }
  else if (direction === RIGHT) { curLocation[0]++; }

  // Boundary check
  if      (curLocation[1] < 0 ) { curLocation[1] = gridResolutionY - 1; }
  else if (curLocation[1] > gridResolutionY - 1 ) { curLocation[1] = 0; }
  else if (curLocation[0] < 0 ) { curLocation[0] = gridResolutionX - 1; }
  else if (curLocation[0] > gridResolutionX - 1 ) { curLocation[0] = 0; }

  // Shift the snake body
  if (bodyParts.length > bodyLength) { bodyParts.shift(); }

  // Death 💀 and Snacc check 🍬
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

function keyPressed() {
  if (!directionLocked) { //prevents a player to abuse pressing multiple directions to turn directly
    if      (keyCode === UP_ARROW)    { if (direction !== DOWN) direction = UP;   } 
    else if (keyCode === DOWN_ARROW)  { if (direction !== UP)   direction = DOWN; }
    else if (keyCode === LEFT_ARROW)  { if (direction !== RIGHT)direction = LEFT; }
    else if (keyCode === RIGHT_ARROW) { if (direction !== LEFT) direction = RIGHT;}
    directionLocked = true;
  }
  // Continue the game after death
  if (keyCode === ENTER) { frameRate(gameSpeed); }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0,0,0,100);
  fieldOffsetX = (windowWidth/2)-(fieldWidth/2);
  fieldOffsetY = (windowHeight/2)-(fieldHeight/2);
  squareSize = fieldWidth / gridResolutionX;
}
