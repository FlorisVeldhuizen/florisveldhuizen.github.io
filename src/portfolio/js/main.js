import paper from "paper";

window.onload = () => {
  const charspeed = 1;
  const maxspeed = 6;
  const drag = 0.9;
  const canvas = document.getElementById("canvas");
  paper.setup(canvas);

  const charpos = new paper.Point(0, 0);
  const movevector = new paper.Point(0, 0);
  const speedvector = new paper.Point(0, 0);

  const pathArray = [];
  const maxArraylength = 20;

  let path;

  // controller vars
  let upPressed = 0;
  let downPressed = 0;
  let leftPressed = 0;
  let rightPressed = 0;

  const setMovevector = () => {
    movevector.length = 0;
    movevector.y += -1 * upPressed;
    movevector.y += 1 * downPressed;
    movevector.x += -1 * leftPressed;
    movevector.x += 1 * rightPressed;
  };

  const checkKey = (e, keydown) => {
    if (e.keyCode === 38 || e.keyCode === 87) {
      upPressed = keydown;
      // up arrow + w
    }
    if (e.keyCode === 40 || e.keyCode === 83) {
      downPressed = keydown;
      // down arrow + s
    }
    if (e.keyCode === 37 || e.keyCode === 65) {
      leftPressed = keydown;
      // left arrow + a
    }
    if (e.keyCode === 39 || e.keyCode === 68) {
      rightPressed = keydown;
      // right arrow + d
    }
    setMovevector();
  };

  const keyUp = (e) => {
    const event = e || window.event;
    checkKey(event, 0);
  };

  const keyDown = (e) => {
    const event = e || window.event;
    checkKey(event, 1);
  };

  const speedqualizervector = () => {
    const tempVector = new paper.Point(movevector.x, movevector.y);
    tempVector.normalize();
    tempVector.x *= charspeed;
    tempVector.y *= charspeed;
    speedvector.x += tempVector.x;
    speedvector.y += tempVector.y;

    // checks if the player moves faster than the maximum speed
    if (speedvector.length > maxspeed) {
      speedvector.length = maxspeed;
    }
    // if the player is not moving, the character should stop
    if (!speedvector.isZero()) {
      if (movevector.x === 0) speedvector.x *= drag;
      if (movevector.y === 0) speedvector.y *= drag;
    }
    speedvector.x *= drag;
    speedvector.y *= drag;
  };

  const pathHandler = (curPath) => {
    const tempPath = curPath.clone();
    tempPath.scale(1.1);
    tempPath.strokeColor = "blue";
    pathArray.push(tempPath);
    pathArray.forEach(function (item) {
      item.scale(1.1);
    });
    if (pathArray.length > maxArraylength) {
      pathArray.shift().remove();
    }
  };

  const drawPlayer = () => {
    path.add(charpos);
    path.strokeColor = "black";
  };

  const init = () => {
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    path = new paper.Path();
    path.add(charpos);
    path.strokeColor = "black";
  };

  const optimization = () => {
    if (path.segments.length % maxArraylength === 0) {
      path.simplify(0.1);
    }
  };

  paper.view.onFrame = () => {
    speedqualizervector();
    charpos.x += speedvector.x;
    charpos.y += speedvector.y;
    drawPlayer();
    pathHandler(path);
    optimization();
  };

  init();
};
