import p5 from "p5";

const sketch = (p) => {
  /*
  Made by: Floris Veldhuizen
  */

  let charpos, goalpos, leftpos, rightpos, leftfoot, rightfoot, speedvector, movevector, lastAngle = 0, charAngle = 0;
  let gpbool = false, mcbool = false, stepbool = false, stepboolcounter = 0;

  //player variables
  let charspeed = 1,
      maxspeed = 4,
      stepspeed = 25,
      drag = 0.9;

  // controller values
  let upPressed = 0, downPressed = 0, leftPressed = 0, rightPressed = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    movevector = p.createVector(0,0);
    speedvector = p.createVector(0,0);
    goalpos = p.createVector(0,0);
    charpos = p.createVector( p.windowWidth/2, p.windowHeight/2);
    leftpos = p.createVector(charpos.x-20,charpos.y);
    rightpos = p.createVector(charpos.x+20,charpos.y);
    leftfoot = p.createVector(charpos.x-20,charpos.y);
    rightfoot = p.createVector(charpos.x+20,charpos.y);
  }

  p.draw = () => {
    p.background(255,255,255,255);
    if (mcbool) {
      p.ellipse(p.mouseX, p.mouseY, 40, 40);
      vectorControl();
    } else if (gpbool) {
      p.ellipse(goalpos.x, goalpos.y, 40, 40);
      vectorControl(goalpos.x,goalpos.y);
    }
    speedqualizervector();
    legReworked();
    lastAngle = charAngle;
    if(stepboolcounter > stepspeed){
      stepboolcounter = 0;
      stepbool = !stepbool;
    }
    stepboolcounter++;
  }

  function legReworked(){
      let curAngle = charAngle - lastAngle;
      rightpos.add(speedvector);
      leftpos.add(speedvector);
      leftpos = pointRotate(leftpos,charpos,curAngle);
      rightpos = pointRotate(rightpos,charpos,curAngle);

      if(!stepbool){
        leftfoot = p5.Vector.lerp(leftfoot,leftpos,0.1);
      } else if (stepbool) {
        rightfoot = p5.Vector.lerp(rightfoot,rightpos,0.1);
      }

      // draw them leggos
      p.ellipse(leftfoot.x, leftfoot.y, 10, 10);
      p.ellipse(rightfoot.x, rightfoot.y, 10, 10);
  }

  function speedqualizervector(){
    speedvector.add(movevector.mult(charspeed));
    speedvector.limit(maxspeed);
    const speedvmagSq = speedvector.magSq();
    //if the player is not moving, the character should stop
    if (speedvmagSq > 0) {
      if(speedvmagSq.toFixed(2) > 0){
        if(movevector.x===0) speedvector.x *= drag;
        if(movevector.y===0) speedvector.y *= drag;
        charAngle = speedvector.heading() + p.HALF_PI;
      } else {
        speedvector.mult(0);
        charAngle = lastAngle;
      }
    }
    charpos.add(speedvector);
  }

  function setMovevector(){
    gpbool = false;
    movevector.mult(0);
    movevector.y += -1 * upPressed;
    movevector.y += 1 * downPressed;
    movevector.x += -1 * leftPressed;
    movevector.x += 1 * rightPressed;
    movevector.normalize();
  }

  function vectorControl(x = p.mouseX,y = p.mouseY){
    let vectorangle = p.createVector(0,0);
    vectorangle.x = (x - charpos.x);
    vectorangle.y = (y - charpos.y);
    if(vectorangle.magSq() > 15){
      movevector = vectorangle.normalize();
    } else {
      speedvector.mult(drag**2);
      movevector.mult(0);
      gpbool = false;
    }
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
  }

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
  }
  p.mousePressed = () => {
    mcbool = true;
    gpbool = false;
  }
  p.mouseReleased = () => {
    mcbool = false;
    gpbool = true;
    goalpos.x = p.mouseX;
    goalpos.y = p.mouseY;
    movevector.x = 0;
    movevector.y = 0;
  }
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  /**
  * For lack of better rotation in p.js
  * @param {vector} p5.Vector  	This is the vector (coord) that you want to rotate
  * @param {pivot}  p5.Vector  	This is the vector (coord) you want to pivot around
  * @param {angle}	number  		This is the angle of the rotation in radians
  */
  function pointRotate(vector,pivot,angle){
    const s = p.sin(angle);
    const c = p.cos(angle);
    // translate point back to origin:
    vector.sub(pivot);
    // rotate point
    let xnew = vector.x * c - vector.y * s;
    let ynew = vector.x * s + vector.y * c;
    // translate point back:
    vector.x = xnew + pivot.x;
    vector.y = ynew + pivot.y;
    return vector;
  }
};

const sketchInstance = new p5(sketch);
