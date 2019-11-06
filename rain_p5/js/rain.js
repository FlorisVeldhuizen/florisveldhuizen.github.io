let raindrops = [];
let gravity = 0.1;
let terminalvelocity = 20;
let rainy = 180;
let mousesize = 100;

function setup() {
	createCanvas(windowWidth, windowHeight);
	for (let i = 0; i < rainy; i++) {
		 raindrops.push(new Drop());
	}
}

function draw(){
	background(0,0,0,100);
	for (let i = 0; i < raindrops.length; i++) {
		raindrops[i].wind();
    raindrops[i].fall();
		raindrops[i].show();
  }
}

function Drop(){
	this.x = random(width);
  this.y = random(-10, -height);
  this.speed = random(0, 2);
	this.falling = true;
	this.splash = false;
	this.splashlocx = 0;
	this.splashlocy = height;
	this.splashprocess = 0;
	this.windpower = 10;

	this.show = function() {
		if (this.splash) {
			stroke(255);
		 	line(this.splashlocx, this.splashlocy, this.splashlocx - random(4,11), this.splashlocy - random(5,10));
			line(this.splashlocx, this.splashlocy, this.splashlocx, this.splashlocy - random(10,16));
			line(this.splashlocx, this.splashlocy, this.splashlocx + random(4,11), this.splashlocy - random(5,10));
			fill(color(0));
			noStroke();
			circle(this.splashlocx, this.splashlocy, this.splashprocess);
			this.splashprocess++;
			if(this.splashprocess>16){
				this.splash = false;
				this.falling = true;
				this.splashprocess = 0;
			}
		}
		if (this.falling) {
		 	stroke(255);
		 	line(this.x, this.y, this.x + this.windpower, this.y + this.speed);
 		}
 	}

	this.fall = function() {
		if(this.falling){
			this.x = this.x + this.windpower;
			this.y = this.y + this.speed;
			this.speed = this.speed + gravity;
			if(this.y > height){
				resetRain(this,height);
			}
			else if(collisionRain(this.x,this.y)) {
				resetRain(this,this.y);
			}
			if(this.x > width){
				this.x = 0;
			}
			if(this.x < 0){
				this.x = width;
			}
		}
  }

	this.wind = function(){
		this.windpower = -(width/2-mouseX)/100;
	}
}

function collisionRain(x,y) {
	if(x > mouseX - (mousesize/2) && x < mouseX + (mousesize/2) && y > mouseY && y < mouseY + mousesize) {
		return true; //if hit
	} else {
		return false;
	}
}

function resetRain(that,splashlocy){
	that.splash = true;
	that.falling = false;
	that.splashlocy = splashlocy;
	that.splashlocx = that.x;
	that.x = random(width);
	that.y = -10;
	if(that.speed > terminalvelocity)
		that.speed = terminalvelocity;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
	raindrops = [];
	for (let i = 0; i < rainy; i++) {
		 raindrops.push(new Drop());
	}
}
