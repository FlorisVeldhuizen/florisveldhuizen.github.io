var charspeed = 1,
	maxspeed = 6,
	drag = 0.9;

var charpos = new Point(0,0),
    movevector = new Point(0,0),
	speedvector = new Point(0, 0);

var pathArray = [],
    maxArraylength = 40;

// controller vars
var upPressed = 0, 
    downPressed = 0, 
    leftPressed = 0, 
    rightPressed = 0;

document.onkeydown = keydown;
document.onkeyup = keyup;

function keyup(e){
    e = e || window.event;
    checkKey(e,0);
}

function keydown(e){
    e = e || window.event;
    checkKey(e,1);
}

function setMovevector(){
    movevector.length = 0;
    movevector.y += -1 * upPressed;
    movevector.y += 1 * downPressed;
    movevector.x += -1 * leftPressed;
    movevector.x += 1 * rightPressed;
}

function checkKey(e,keydown){
    if (e.keyCode == '38') {
        upPressed = keydown;
        // up arrow
    }
    if (e.keyCode == '40') {
        downPressed = keydown;
        // down arrow
    }
    if (e.keyCode == '37') {
        leftPressed = keydown;
       // left arrow
    }
    if (e.keyCode == '39') {
        rightPressed = keydown;
       // right arrow
    }
    setMovevector();
}

function speedqualizervector(){
	_movevector = new Point(movevector.x, movevector.y);
	_movevector.normalize();
	speedvector += (_movevector*charspeed);

	//checks if the player moves faster than the maximum speed
	if( speedvector.length > maxspeed){
		speedvector.length = maxspeed;
	}
	//if the player is not moving, the character should stop 
	if(!speedvector.isZero()){
		if(movevector.x==0) speedvector.x *= drag;
		if(movevector.y==0) speedvector.y *= drag;
	}
}

function pathHandler(curPath){
    _curPath = curPath.clone();
    _curPath.scale(1.1);
    _curPath.strokeColor = 'blue';
    pathArray.push(_curPath);
    pathArray.forEach(function(item){
        item.scale(1.1);
    });
    if (pathArray.length > maxArraylength){
        pathArray.shift().remove();
    }
}

function drawPlayer(){
    path.add(charpos);
    path.strokeColor = 'black';
}

function init(){
    path = new Path();
    path.add(charpos);
    path.strokeColor = 'black';
}

function optimization(){
    if(path.segments.length%maxArraylength==0){
        path.simplify(0.1);
    }
}

function onFrame(event){
    speedqualizervector();
    charpos += speedvector;
    drawPlayer();
    pathHandler(path);
    optimization();
    
}

init();
