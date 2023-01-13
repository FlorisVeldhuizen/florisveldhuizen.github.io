// Crude mashup of the walking and wavy scripts, to simulate Noor walking

/* eslint-disable max-classes-per-file */
import p5 from "p5";

let trees;

// Perlin noise offset
let yoff = 0;
let xoff = 0;

const flexibility = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7];

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

    p.imageMode(p.CENTER);
    p.background(116, 89, 97);

    const tree = new Tree(
      p.windowWidth / 2 - 250,
      p.windowHeight / 2,
      100,
      flexibility,
      0.1,
      0.1
    );
    const tree2 = new Tree(
      p.windowWidth / 2 + 250,
      p.windowHeight / 2,
      100,
      flexibility,
      0.5,
      0.1
    );
    trees = [tree, tree2];

  };

  p.draw = () => {
    p.background(255, 255, 255, 255);
    p.stroke(0);
    p.fill(255);
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


    p.noStroke();
    trees.forEach((treee) => {
      treee.draw();
    });
    yoff += 0.005;
  };

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

  /*
  KEY SHIT
  */
  p.keyPressed = () => {
    if (p.keyCode === p.LEFT_ARROW || p.key === "a") {
      leftPressed = 1;
    }
    if (p.keyCode === p.RIGHT_ARROW || p.key === "d") {
      rightPressed = 1;
    }
    if (p.keyCode === p.UP_ARROW || p.key === "w") {
      upPressed = 1;
    }
    if (p.keyCode === p.DOWN_ARROW || p.key === "s") {
      downPressed = 1;
    }
    setMovevector();
  };

  p.keyReleased = () => {
    if (p.keyCode === p.LEFT_ARROW || p.key === "a") {
      leftPressed = 0;
    }
    if (p.keyCode === p.RIGHT_ARROW || p.key === "d") {
      rightPressed = 0;
    }
    if (p.keyCode === p.UP_ARROW || p.key === "w") {
      upPressed = 0;
    }
    if (p.keyCode === p.DOWN_ARROW || p.key === "s") {
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

  class Tree {
    constructor(x, y, size, flexibilityArray) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.flexibilityArray = flexibilityArray;
      this.slices = [];
      this.setup();
    }

    setup() {
      for (let i = 0; i < this.flexibilityArray.length; i++) {
        this.slices.push(
          new TreeSlice(this.x, this.y, this.size, i, this.flexibilityArray[i])
        );
      }
    }

    draw() {
      yoff += 0.0001;
      this.slices.forEach((slice) => {
        slice.draw(this.windX, this.windY);
      });
    }
  }

  class TreeSlice {
    constructor(x, y, radius, level, flexibility) {
      this.x = x;
      this.y = y;
      this.radius = radius - level * 6;
      this.level = level + 2;
      this.flexibility = flexibility;
      this.branches = [];
      this.leaves = [];
      this.setup();
    }

    setup() {
      const setRandomBranchLocations = () => {
        for (let g = 0; g < this.level; g++) {
          // this.x + random(-this.radius, this.radius) * 0.7,
          // this.y + random(-this.radius, this.radius) * 0.7,
          this.branches.push([
            this.x + p.random(-this.radius, this.radius) * 0.15 * this.level,
            this.y + p.random(-this.radius, this.radius) * 0.15 * this.level,
          ]);
        }
      };
      setRandomBranchLocations();

      for (let l = 0; l < this.branches.length; l++) {
        this.leaves.push(
          new Leave(
            this.branches[l][0],
            this.branches[l][1],
            this.radius + 30 / this.level,
            this.level,
            this.flexibility
          )
        );
      }
    }

    draw() {
      xoff = this.level * 0.02;
      this.leaves.forEach((leave, index) => {
        const theta = p.map(
          p.noise(xoff + index, yoff),
          0,
          1,
          -p.PI / 3,
          p.PI / 3
        );
        leave.update(theta * 60, -theta * 60);
        leave.draw();
      });
    }
  }

  class Leave {
    constructor(x, y, radius, level, _flexibility) {
      this.x = x + p.random(5, 10);
      this.y = y + p.random(5, 10);
      this.radius = radius;
      this.level = level;
      this.flexibility = _flexibility; // * random(1, 2);
      this.offsetX = 0;
      this.offsetY = 0;
    }

    draw() {
      p.fill(0, 100 + this.level * 20, 0, 220);
      p.circle(
        this.x + this.offsetX,
        this.y + this.offsetY + p.random(0, 1),
        this.radius
      );
    }

    update(windX, windY) {
      this.offsetX = windX * this.flexibility;
      this.offsetY = windY * this.flexibility;
    }
  }
};

const sketchInstance = new p5(sketch);
