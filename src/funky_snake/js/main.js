import p5 from "p5";

const sketch = (p) => {
  /*
  Made by: Floris Veldhuizen
  Queuing of moves was adapted from: https://github.com/patorjk/JavaScript-Snake/blob/master/js/snake.js
  */

  // PARAMS
  const fieldWidth = 400;
  const fieldHeight = 400;
  const gridResX = 14; // How many squares fit in a row  (default: 14)
  const gameSpeed = 20; // Amount of frames per second    (default: 12)
  const snakeSize = 5;

  // GLOBAL VARIABLES
  const NIL = -1;
  const _RIGHT = 0;
  const _DOWN = 1;
  const _LEFT = 2;
  const _UP = 3;

  // PRECALCULATED VALUES
  let fieldOffsetX;
  let fieldOffsetY;
  let squareSize;
  let gridResY;
  let maxLength;
  let lastDir;

  // TOUCH CONTROLS
  let startTouchX;
  let startTouchY;
  let touchControl = false; // If true, the touch controls are displayed on screen
  let touchDir = NIL;
  const arcSize = 120; // Diameter of the touch controls

  let isFirstMove = true;
  let preMove = NIL;
  let curDir = _RIGHT;
  const curLoc = [0, 0];
  let bodyParts = [];
  let bodyLength = snakeSize - 1;
  let death = false;
  let iterationCounter = 0;
  let snaccPos = [0, 0];
  const _frameRate = Math.floor(60 / gameSpeed); // Assuming 60 fps
  let highScore = 0;

  p.setup = () => {
    p.frameRate(60);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(0, 0, 0, 100);
    fieldOffsetX = p.windowWidth / 2 - fieldWidth / 2;
    fieldOffsetY = p.windowHeight / 2 - fieldHeight / 2;
    squareSize = fieldWidth / gridResX;
    gridResY = Math.floor(fieldHeight / squareSize);
    maxLength = gridResX * gridResY;
    spawnSnacc();
  };

  p.draw = () => {
    if (touchControl) calcTouch();
    if (iterationCounter > _frameRate) {
      p.background(0, 0, 0, 100);
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
  };

  const reset = () => {
    p.fill(255);
    p.rect(0, 0, p.windowWidth, p.windowHeight);
    p.background(0, 0, 0, 100);
    bodyLength = snakeSize - 1;
    bodyParts = [];
    death = false;
  };

  const drawGrid = () => {
    p.stroke(255);
    p.fill(0);
    for (let i = 0; i < gridResX; i++) {
      // x-axis
      for (let j = 0; j < gridResY; j++) {
        // y-axis
        p.rect(
          i * squareSize + fieldOffsetX,
          j * squareSize + fieldOffsetY,
          squareSize,
          squareSize
        );
      }
    }
  };

  const drawScore = () => {
    const fontSize = 30;
    const curScore = bodyLength - (snakeSize - 1);
    if (curScore > highScore) highScore = curScore;
    p.textSize(fontSize);
    p.fill(255);
    // Highscore
    p.textAlign(p.RIGHT);
    p.text(
      `${String.fromCodePoint(0x1f3c6)}: ${highScore}`,
      fieldOffsetX + fieldWidth,
      fieldOffsetY - fontSize
    );
    // Current score
    p.textAlign(p.LEFT);
    p.text(
      `${String.fromCodePoint(0x1f36c)}: ${curScore}`,
      fieldOffsetX,
      fieldOffsetY - fontSize
    );
  };

  const spawnSnacc = () => {
    // TO-DO: use maxLength to determine when the game is over
    const returnRandomPos = () => {
      const xPos = Math.floor(Math.random() * gridResX);
      const yPos = Math.floor(Math.random() * gridResY);
      const overlap = bodyParts.some(
        (part) => part[0] === xPos && part[1] === yPos
      );
      return overlap ? returnRandomPos() : [xPos, yPos];
    };

    const returnAvailablePos = () => {
      const gridObject = {};
      const copyParts = [...bodyParts];
      [...Array(gridResX)].forEach(
        (_, i) => (gridObject[i] = [...Array(gridResY).keys()])
      );
      for (const [key, value] of Object.entries(gridObject)) {
        const keyInt = parseInt(key);
        gridObject[key] = value.filter(
          (elem) =>
            !copyParts.some((part) => part[0] === keyInt && part[1] === elem)
        );
        if (gridObject[key].length < 1) delete gridObject[key];
      }
      const availableKeys = Object.keys(gridObject);
      const availableX = parseInt(
        availableKeys[Math.floor(Math.random() * availableKeys.length)]
      );
      const availableY =
        gridObject[availableX][
          Math.floor(Math.random() * gridObject[availableX].length)
        ];
      return [availableX, availableY];
    };

    return (snaccPos =
      bodyLength < maxLength / 2 ? returnRandomPos() : returnAvailablePos());
  };

  const drawSnacc = () => {
    p.textSize(32);
    p.text(
      `${String.fromCodePoint(0x1f36c)}`,
      snaccPos[0] * squareSize + fieldOffsetX,
      (snaccPos[1] + 0.9) * squareSize + fieldOffsetY
    );
  };

  const calcNewPos = () => {
    // Set lastDir and check for queued moves
    lastDir = curDir;
    if (preMove !== NIL) {
      curDir = preMove;
      preMove = NIL;
    }
    isFirstMove = true;

    // Calculate new position of body based on direction
    if (lastDir === _UP) {
      curLoc[1]--;
    } else if (lastDir === _DOWN) {
      curLoc[1]++;
    } else if (lastDir === _LEFT) {
      curLoc[0]--;
    } else if (lastDir === _RIGHT) {
      curLoc[0]++;
    }

    // Boundary check
    if (curLoc[1] < 0) {
      curLoc[1] = gridResY - 1;
    } else if (curLoc[1] > gridResY - 1) {
      curLoc[1] = 0;
    } else if (curLoc[0] < 0) {
      curLoc[0] = gridResX - 1;
    } else if (curLoc[0] > gridResX - 1) {
      curLoc[0] = 0;
    }

    // Shift the snake body
    if (bodyParts.length > bodyLength) {
      bodyParts.shift();
    }

    // Death 💀 check
    bodyParts.forEach((part) => {
      if (curLoc[0] === part[0] && curLoc[1] === part[1]) {
        death = true;
        console.error(`U DEAD ${String.fromCodePoint(0x1f480)}`);
      }
    });

    // Set all bodyparts
    bodyParts.push([...curLoc]);

    // Snacc 🍬 check
    if (curLoc[0] === snaccPos[0] && curLoc[1] === snaccPos[1]) {
      bodyLength++;
      spawnSnacc();
    }
  };

  const drawPlayer = () => {
    const colorInterval = Math.floor(155 / bodyLength);
    bodyParts.forEach((part, index) => {
      p.fill(index * colorInterval + 100, 0, 0);
      p.rect(
        part[0] * squareSize + fieldOffsetX,
        part[1] * squareSize + fieldOffsetY,
        squareSize,
        squareSize
      );
    });
  };

  const setDirection = (dir) => {
    if (curDir !== lastDir) {
      preMove = dir;
    }
    if (Math.abs(dir - lastDir) !== 2 && isFirstMove) {
      curDir = dir;
      isFirstMove = false;
    }
    touchDir = dir;
  };

  const calcTouch = () => {
    const distSquared = (x1, y1, x2, y2) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return dx * dx + dy * dy;
    };
    let radianDistance = Math.atan2(
      p.mouseY - startTouchY,
      p.mouseX - startTouchX
    );
    if (radianDistance < 0) radianDistance += p.TWO_PI;
    if (distSquared(startTouchX, startTouchY, p.mouseX, p.mouseY) > 100) {
      if (
        radianDistance > p.TWO_PI - p.QUARTER_PI ||
        radianDistance < p.QUARTER_PI
      ) {
        setDirection(_RIGHT);
      } else if (
        radianDistance > p.QUARTER_PI &&
        radianDistance < p.HALF_PI + p.QUARTER_PI
      ) {
        setDirection(_DOWN);
      } else if (
        radianDistance > p.HALF_PI + p.QUARTER_PI &&
        radianDistance < p.PI + p.QUARTER_PI
      ) {
        setDirection(_LEFT);
      } else if (
        radianDistance > p.PI + p.QUARTER_PI &&
        radianDistance < p.TWO_PI - p.QUARTER_PI
      ) {
        setDirection(_UP);
      }
    } else {
      touchDir = NIL;
    }
  };

  const drawTouch = () => {
    const bottomArc = () =>
      p.arc(
        startTouchX,
        startTouchY,
        arcSize,
        arcSize,
        p.QUARTER_PI,
        p.HALF_PI + p.QUARTER_PI
      );
    const leftArc = () =>
      p.arc(
        startTouchX,
        startTouchY,
        arcSize,
        arcSize,
        p.HALF_PI + p.QUARTER_PI,
        p.PI + p.QUARTER_PI
      );
    const topArc = () =>
      p.arc(
        startTouchX,
        startTouchY,
        arcSize,
        arcSize,
        p.PI + p.QUARTER_PI,
        p.TWO_PI - p.QUARTER_PI
      );
    const rightArc = () =>
      p.arc(
        startTouchX,
        startTouchY,
        arcSize,
        arcSize,
        p.TWO_PI - p.QUARTER_PI,
        p.QUARTER_PI
      );

    p.fill(100);
    p.ellipse(startTouchX, startTouchY, arcSize, arcSize);
    p.fill(200);
    if (touchDir === _UP) topArc();
    if (touchDir === _DOWN) bottomArc();
    if (touchDir === _LEFT) leftArc();
    if (touchDir === _RIGHT) rightArc();

    // TO-DO: DRAW JOYSTICK THAT IS constrained BY BOUNDARIES OF CONTROL
    p.fill(50);
    p.ellipse(p.mouseX, p.mouseY, arcSize / 2, arcSize / 2);
  };

  const handleTouchEnd = () => {
    touchControl = false;
    return false;
  };

  const handleTouchBegin = () => {
    startTouchX = p.mouseX;
    startTouchY = p.mouseY;
    touchControl = true;
    return false;
  };

  const handleKeys = (keyType, up, down, left, right) => {
    if (keyType === right) {
      setDirection(_RIGHT);
    }
    if (keyType === down) {
      setDirection(_DOWN);
    }
    if (keyType === left) {
      setDirection(_LEFT);
    }
    if (keyType === up) {
      setDirection(_UP);
    }
  };

  p.mousePressed = () => {
    return handleTouchBegin();
  };

  p.touchStarted = () => {
    return handleTouchBegin();
  };

  p.mouseReleased = () => {
    return handleTouchEnd();
  };

  p.touchEnded = () => {
    return handleTouchEnd();
  };

  p.keyTyped = () => {
    handleKeys(p.key, "w", "s", "a", "d");
  };

  p.keyPressed = () => {
    handleKeys(
      p.keyCode,
      p.UP_ARROW,
      p.DOWN_ARROW,
      p.LEFT_ARROW,
      p.RIGHT_ARROW
    );
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(0, 0, 0, 100);
    fieldOffsetX = p.windowWidth / 2 - fieldWidth / 2;
    fieldOffsetY = p.windowHeight / 2 - fieldHeight / 2;
    squareSize = fieldWidth / gridResX;
  };
};

const sketchInstance = new p5(sketch);
