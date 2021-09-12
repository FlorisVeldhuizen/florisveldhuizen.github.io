import React from "react";
import { ReactP5Wrapper } from "react-p5-wrapper";

const sketch = (p5) => {
  /*
  Made by: Floris Veldhuizen
  Queuing of moves was adapted from: https://github.com/patorjk/JavaScript-Snake/blob/master/js/snake.js
  */

  // PARAMS
  const fieldWidth = 400;
  const fieldHeight = 400;
  const backgroundColor = 255;
  const gridResX = 14;          // How many squares fit in a row  (default: 14)
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

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(0,0,0,100);
    fieldOffsetX = (p5.windowWidth/2)-(fieldWidth/2);
    fieldOffsetY = (p5.windowHeight/2)-(fieldHeight/2);
    squareSize = fieldWidth / gridResX;
    gridResY = Math.floor(fieldHeight / squareSize);
    maxLength = gridResX * gridResY;
    spawnSnacc();
  }

  p5.draw = () => {
    if (touchControl) calcTouch();
    if (iterationCounter > _frameRate) {
      p5.background(0,0,0,100);
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
    p5.fill(255);
    p5.rect(0,0,p5.windowWidth,p5.windowHeight);
    p5.background(0,0,0,100);
    bodyLength = snakeSize - 1;
    bodyParts = [];
    death = false;
  }

  const drawGrid = () => {
    p5.stroke(255)
    p5.fill(0);
    for (let i = 0; i < gridResX; i++) { // x-axis
      for (let j = 0; j < gridResY; j++) { // y-axis
        p5.rect(i * squareSize + fieldOffsetX, j * squareSize + fieldOffsetY, squareSize, squareSize);
      }
    }
  }

  const drawScore = () => {
    const fontSize = 30;
    const curScore = bodyLength - (snakeSize - 1);
    if(curScore > highScore) highScore = curScore;
    p5.textSize(fontSize);
    p5.fill(255)
    // Highscore
    p5.textAlign(p5.RIGHT);
    p5.text(`${String.fromCodePoint(0x1F3C6)}: ${highScore}`, fieldOffsetX + fieldWidth, fieldOffsetY - fontSize);
    // Current score
    p5.textAlign(p5.LEFT);
    p5.text(`${String.fromCodePoint(0x1F36C)}: ${curScore}`, fieldOffsetX, fieldOffsetY - fontSize);
  }

  const spawnSnacc = () => {
    // TO-DO: use maxLength to determine when the game is over
    const returnRandomPos = () => {
      const xPos = Math.floor(Math.random() * gridResX);
      const yPos = Math.floor(Math.random() * gridResY);
      const overlap = bodyParts.some(part => (part[0] === xPos && part[1] === yPos));
      return overlap ? returnRandomPos() : [xPos, yPos];
    }

    const returnAvailablePos = () => {
      const gridObject = {};
      [...Array(gridResX)].forEach((_,i) => gridObject[i] = [...Array(gridResY).keys()]);
      for (const [key, value] of Object.entries(gridObject)) {
        const keyInt = parseInt(key);
        gridObject[key] = value.filter(elem =>
          !bodyParts.some(part => part[0] === keyInt && part[1] === elem)
        )
        if (gridObject[key].length < 1) delete gridObject[key];
      }
      const availableKeys = Object.keys(gridObject);
      const availableX = parseInt(availableKeys[Math.floor(Math.random() * availableKeys.length)]);
      const availableY = gridObject[availableX][Math.floor(Math.random() * gridObject[availableX].length)];
      return [availableX, availableY];
    }

  return snaccPos = bodyLength < maxLength / 2 ? returnRandomPos() : returnAvailablePos();
  }

  const drawSnacc = () => {
    p5.textSize(32);
    p5.text(`${String.fromCodePoint(0x1F36C)}`, snaccPos[0] * squareSize + fieldOffsetX, (snaccPos[1] + 0.9) * squareSize + fieldOffsetY);
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
    if      (curLoc[1] < 0) { curLoc[1] = gridResY - 1 }
    else if (curLoc[1] > gridResY - 1) { curLoc[1] = 0 }
    else if (curLoc[0] < 0) { curLoc[0] = gridResX - 1 }
    else if (curLoc[0] > gridResX - 1) { curLoc[0] = 0 }

    // Shift the snake body
    if (bodyParts.length > bodyLength) { bodyParts.shift(); }

    // Death 💀 check
    bodyParts.forEach(part => {
      if (curLoc[0] === part[0] && curLoc[1] === part[1]) {
      death = true;
      console.error(`U DEAD ${String.fromCodePoint(0x1F480)}`);
      }
    });

    // Set all bodyparts
    bodyParts.push([...curLoc]);

    // Snacc 🍬 check
    if (curLoc[0] === snaccPos[0] && curLoc[1] === snaccPos[1]) {
      bodyLength++;
      spawnSnacc();
    }
  }

  const drawPlayer = () => {
    const colorInterval = Math.floor(155 / bodyLength);
    bodyParts.forEach((part,index) => {
      p5.fill(index * colorInterval + 100,0,0);
      p5.rect(part[0] * squareSize + fieldOffsetX, part[1] * squareSize + fieldOffsetY, squareSize, squareSize);
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
    let radianDistance = Math.atan2(p5.mouseY-startTouchY, p5.mouseX-startTouchX);
    if (radianDistance < 0) radianDistance = radianDistance + p5.TWO_PI;
    if(distSquared(startTouchX, startTouchY, p5.mouseX, p5.mouseY) > 100) {
      if      (radianDistance > p5.TWO_PI - p5.QUARTER_PI || radianDistance < p5.QUARTER_PI)          { setDirection(_RIGHT)}
      else if (radianDistance > p5.QUARTER_PI && radianDistance < p5.HALF_PI + p5.QUARTER_PI)         { setDirection(_DOWN) }
      else if (radianDistance > p5.HALF_PI + p5.QUARTER_PI && radianDistance < p5.PI + p5.QUARTER_PI) { setDirection(_LEFT) }
      else if (radianDistance > p5.PI + p5.QUARTER_PI && radianDistance < p5.TWO_PI - p5.QUARTER_PI)  { setDirection(_UP)   }
    } else {
      touchDir = NIL;
    }
  }

  const drawTouch = () => {
    const bottomArc = () => p5.arc(startTouchX, startTouchY, arcSize, arcSize, p5.QUARTER_PI, p5.HALF_PI + p5.QUARTER_PI);
    const leftArc   = () => p5.arc(startTouchX, startTouchY, arcSize, arcSize, p5.HALF_PI + p5.QUARTER_PI, p5.PI + p5.QUARTER_PI);
    const topArc    = () => p5.arc(startTouchX, startTouchY, arcSize, arcSize, p5.PI + p5.QUARTER_PI, p5.TWO_PI - p5.QUARTER_PI);
    const rightArc  = () => p5.arc(startTouchX, startTouchY, arcSize, arcSize, p5.TWO_PI - p5.QUARTER_PI, p5.QUARTER_PI);

    p5.fill(100);
    p5.ellipse(startTouchX, startTouchY, arcSize, arcSize);
    p5.fill(200);
    if (touchDir === _UP)    topArc();
    if (touchDir === _DOWN)  bottomArc();
    if (touchDir === _LEFT)  leftArc();
    if (touchDir === _RIGHT) rightArc();

    // TO-DO: DRAW JOYSTICK THAT IS constrained BY BOUNDARIES OF CONTROL
    p5.fill(50);
    p5.ellipse(p5.mouseX, p5.mouseY, arcSize/2, arcSize/2);
  }

  const handleTouchEnd = () => {
    touchControl = false;
    return false;
  }

  const handleTouchBegin = () => {
    startTouchX = p5.mouseX;
    startTouchY = p5.mouseY;
    touchControl = true;
    return false;
  }

  const handleKeys = (keyType, up, down, left, right) => {
    if (keyType === right) { setDirection(_RIGHT)}
    if (keyType === down)  { setDirection(_DOWN) }
    if (keyType === left)  { setDirection(_LEFT) }
    if (keyType === up)    { setDirection(_UP)   }
  }

  p5.mousePressed = () => {
    return handleTouchBegin();
  }

  p5.touchStarted = () => {
    return handleTouchBegin();
  }

  p5.mouseReleased = () => {
    return handleTouchEnd();
  }

  p5.touchEnded = () => {
    return handleTouchEnd();
  }

  p5.keyTyped = () => {
    handleKeys(p5.key, "w", "s", "a", "d");
  }

  p5.keyPressed = () => {
    handleKeys(p5.keyCode, p5.UP_ARROW, p5.DOWN_ARROW, p5.LEFT_ARROW, p5.RIGHT_ARROW);
  }

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(0,0,0,100);
    fieldOffsetX = (p5.windowWidth/2)-(fieldWidth/2);
    fieldOffsetY = (p5.windowHeight/2)-(fieldHeight/2);
    squareSize = fieldWidth / gridResX;
  }
}

const FunkySnake = () => {
    return (
        <ReactP5Wrapper sketch={sketch} />
    );
};

export default FunkySnake;
