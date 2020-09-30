let charpos, goalpos, leftpos, rightpos, leftfoot, rightfoot, speedvector, mousevector, lastAngle = 0, charAngle = 0;
let gpbool = false, mcbool = false, stepbool = false, stepboolcounter = 0;

//player variables
let charspeed = 1,
		maxspeed = 4,
		stepspeed = 25,
		drag = 0.9;

// controller values
let upPressed = 0, downPressed = 0, leftPressed = 0, rightPressed = 0;

function setup() {
	createCanvas(windowWidth, windowHeight);
	mousevector = createVector(0,0);
	movevector = createVector(0,0);
	speedvector = createVector(0,0);
	goalpos = createVector(0,0);
	charpos = createVector( windowWidth/2, windowHeight/2);
	leftpos = createVector(charpos.x-20,charpos.y);
	rightpos = createVector(charpos.x+20,charpos.y);
	leftfoot = createVector(charpos.x-20,charpos.y);
	rightfoot = createVector(charpos.x+20,charpos.y);
}

function draw(){
	background(255,255,255,255);
	if (mcbool) {
		ellipse(mouseX, mouseY, 40, 40);
    vectorControl();
  } else if (gpbool) {
		ellipse(goalpos.x, goalpos.y, 40, 40);
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
		} else {
			rightfoot = p5.Vector.lerp(rightfoot,rightpos,0.1);
		}

		// draw them leggos
		ellipse(leftfoot.x, leftfoot.y, 10, 10);
		ellipse(rightfoot.x, rightfoot.y, 10, 10);
}

function speedqualizervector(){
	speedvector.add(movevector.mult(charspeed));
	speedvector.limit(maxspeed);
	const speedvmagSq = speedvector.magSq();
	//if the player is not moving, the character should stop
  if (speedvmagSq > 0) {
		if(speedvmagSq.toFixed(2) > 0){
			if(movevector.x==0) speedvector.x *= drag;
			if(movevector.y==0) speedvector.y *= drag;
			charAngle = speedvector.heading() + HALF_PI;
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

function vectorControl(x = mouseX,y = mouseY){
	let vectorangle = createVector(0,0);
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
function keyPressed() {
	if (keyCode === LEFT_ARROW) {
		leftPressed = 1;
	}
	if (keyCode === RIGHT_ARROW) {
		rightPressed = 1;
	}
	if (keyCode === UP_ARROW) {
		upPressed = 1;
	}
	if (keyCode === DOWN_ARROW) {
		downPressed = 1;
	}
	setMovevector();
}
function keyReleased() {
	if (keyCode === LEFT_ARROW) {
		leftPressed = 0;
	}
	if (keyCode === RIGHT_ARROW) {
		rightPressed = 0;
	}
	if (keyCode === UP_ARROW) {
		upPressed = 0;
	}
	if (keyCode === DOWN_ARROW) {
		downPressed = 0;
	}
	setMovevector();
}
function mousePressed() {
  mcbool = true;
	gpbool = false;
}
function mouseReleased() {
  mcbool = false;
	gpbool = true;
	goalpos.x = mouseX;
	goalpos.y = mouseY;
	movevector.x = 0;
	movevector.y = 0;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**
* For lack of better rotation in p5.js
* @param {vector} p5.Vector  	This is the vector (coord) that you want to rotate
* @param {pivot}  p5.Vector  	This is the vector (coord) you want to pivot around
* @param {angle}	number  		This is the angle of the rotation in radians
*/
function pointRotate(vector,pivot,angle){
  const s = sin(angle);
  const c = cos(angle);
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
