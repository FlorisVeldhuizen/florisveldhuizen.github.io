import p5 from "p5";

const sketch = (p) => {
  /*
  Made by: Floris Veldhuizen
  */

  let charpos;
  let goalpos;
  let leftpos;
  let rightpos;
  let leftfoot;
  let rightfoot;
  let speedvector;
  let movevector;
  let lastAngle = 0;
  let charAngle = 0;
  let gpbool = false;
  let mcbool = false;
  let stepbool = false;
  let stepboolcounter = 0;

  // player variables
  const charspeed = 1;
  const maxspeed = 4;
  const stepspeed = 25;
  const drag = 0.9;

  // controller values
  let upPressed = 0;
  let downPressed = 0;
  let leftPressed = 0;
  let rightPressed = 0;

  let sketchFrame;
  const intervalScale = 5;
  const buildings = [];
  const { windowWidth } = p;
  const { windowHeight } = p;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    movevector = p.createVector(0, 0);
    speedvector = p.createVector(0, 0);
    goalpos = p.createVector(0, 0);
    charpos = p.createVector(p.windowWidth / 2, p.windowHeight / 2);
    leftpos = p.createVector(charpos.x - 20, charpos.y);
    rightpos = p.createVector(charpos.x + 20, charpos.y);
    leftfoot = p.createVector(charpos.x - 20, charpos.y);
    rightfoot = p.createVector(charpos.x + 20, charpos.y);

    setBuilding({
      x: 100,
      y: 100,
      w: 100,
      h: 100,
      title: "test",
      link: "../prince_chazz/index.html",
    });
  };

  p.draw = () => {
    p.background(255, 255, 255, 255);
    if (mcbool) {
      p.ellipse(p.mouseX, p.mouseY, 40, 40);
      vectorControl();
    } else if (gpbool) {
      p.ellipse(goalpos.x, goalpos.y, 40, 40);
      vectorControl(goalpos.x, goalpos.y);
    }
    speedqualizervector();
    legReworked();
    lastAngle = charAngle;
    if (stepboolcounter > stepspeed) {
      stepboolcounter = 0;
      stepbool = !stepbool;
    }
    stepboolcounter++;
    handleBuildings();
  };

  function handleBuildings() {
    buildings.forEach((building) => {
      // console.log(building, building.width, p.windowWidth);
      const checkX =
        charpos.x > building.x && charpos.x < building.x + building.width;
      const checkY =
        charpos.y > building.y && charpos.y < building.y + building.height;
      if (checkX && checkY) {
        console.log("collision");
        if (building.width < (windowWidth - 200)) {
          building.size(windowWidth - 200, windowHeight - 200);
          console.log(building.width);
          building.style("pointer-events", "auto");
        }
      } else if (building.width > 100) {
        building.size(100, 100);
        building.style("pointer-events", "none");
      }
    });
  }

  function legReworked() {
    const curAngle = charAngle - lastAngle;
    rightpos.add(speedvector);
    leftpos.add(speedvector);
    leftpos = pointRotate(leftpos, charpos, curAngle);
    rightpos = pointRotate(rightpos, charpos, curAngle);

    if (!stepbool) {
      leftfoot = p5.Vector.lerp(leftfoot, leftpos, 0.1);
    } else if (stepbool) {
      rightfoot = p5.Vector.lerp(rightfoot, rightpos, 0.1);
    }

    // draw them leggos
    p.ellipse(leftfoot.x, leftfoot.y, 10, 10);
    p.ellipse(rightfoot.x, rightfoot.y, 10, 10);
  }

  function speedqualizervector() {
    speedvector.add(movevector.mult(charspeed));
    speedvector.limit(maxspeed);
    const speedvmagSq = speedvector.magSq();
    // if the player is not moving, the character should stop
    if (speedvmagSq > 0) {
      if (speedvmagSq.toFixed(2) > 0) {
        if (movevector.x === 0) speedvector.x *= drag;
        if (movevector.y === 0) speedvector.y *= drag;
        charAngle = speedvector.heading() + p.HALF_PI;
      } else {
        speedvector.mult(0);
        charAngle = lastAngle;
      }
    }
    charpos.add(speedvector);
  }

  function setMovevector() {
    gpbool = false;
    movevector.mult(0);
    movevector.y += -1 * upPressed;
    movevector.y += 1 * downPressed;
    movevector.x += -1 * leftPressed;
    movevector.x += 1 * rightPressed;
    movevector.normalize();
  }

  function vectorControl(x = p.mouseX, y = p.mouseY) {
    const vectorangle = p.createVector(0, 0);
    vectorangle.x = x - charpos.x;
    vectorangle.y = y - charpos.y;
    if (vectorangle.magSq() > 15) {
      movevector = vectorangle.normalize();
    } else {
      speedvector.mult(drag ** 2);
      movevector.mult(0);
      gpbool = false;
    }
  }

  function setBuilding({ x, y, w, h, title, link }) {
    const building = {
      x,
      y,
      w,
      h,
    };
    sketchFrame = p.createElement("iframe", "p5*js");

    // Set the element's style and position.
    sketchFrame.style("color", "deeppink");
    sketchFrame.style("border", "none");
    sketchFrame.style("pointer-events", "none");
    // sketchFrame.style("width", `${w}px`);
    // sketchFrame.style("height", `${h}px`);
    // sketchFrame.height = h;
    // sketchFrame.width = w;
    sketchFrame.position(x, y);
    sketchFrame.size(w, h);
    sketchFrame.attribute("src", link);
    buildings.push(sketchFrame);
  }

  /*
  KEY SHIT
  */
  p.keyPressed = () => {
    if (p.keyCode === p.LEFT_ARROW) {
      leftPressed = 1;
    }
    if (p.keyCode === p.RIGHT_ARROW) {
      rightPressed = 1;
    }
    if (p.keyCode === p.UP_ARROW) {
      upPressed = 1;
    }
    if (p.keyCode === p.DOWN_ARROW) {
      downPressed = 1;
    }
    setMovevector();
  };

  p.keyReleased = () => {
    if (p.keyCode === p.LEFT_ARROW) {
      leftPressed = 0;
    }
    if (p.keyCode === p.RIGHT_ARROW) {
      rightPressed = 0;
    }
    if (p.keyCode === p.UP_ARROW) {
      upPressed = 0;
    }
    if (p.keyCode === p.DOWN_ARROW) {
      downPressed = 0;
    }
    setMovevector();
  };
  p.mousePressed = () => {
    mcbool = true;
    gpbool = false;
  };
  p.mouseReleased = () => {
    mcbool = false;
    gpbool = true;
    goalpos.x = p.mouseX;
    goalpos.y = p.mouseY;
    movevector.x = 0;
    movevector.y = 0;
  };
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  /**
   * For lack of better rotation in p.js
   * @param {vector} p5.Vector  	This is the vector (coord) that you want to rotate
   * @param {pivot}  p5.Vector  	This is the vector (coord) you want to pivot around
   * @param {angle}	number  		This is the angle of the rotation in radians
   */
  function pointRotate(vector, pivot, angle) {
    const s = p.sin(angle);
    const c = p.cos(angle);
    // translate point back to origin:
    vector.sub(pivot);
    // rotate point
    const xnew = vector.x * c - vector.y * s;
    const ynew = vector.x * s + vector.y * c;
    // translate point back:
    vector.x = xnew + pivot.x;
    vector.y = ynew + pivot.y;
    return vector;
  }
};

const sketchInstance = new p5(sketch);
