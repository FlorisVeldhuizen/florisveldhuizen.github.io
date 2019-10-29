let raindrops = [];
let gravity = 0.1;
let terminalvelocity = 20;
let rainy = 240;
let mousesize = 100;

function setup() {
	createCanvas(windowWidth, windowHeight);
	for (let i = 0; i < rainy; i++) {
		 raindrops.push(new Drop());
	}
}

function draw(){
	background(0,0,0,100);

	for (let i = 0; i < raindrops.length; i = i + 1) {
    raindrops[i].show();
    raindrops[i].fall();
		raindrops[i].wind();
  }
}

function Drop(){
	this.x = random(width);
  this.y = random(-10, -height);
  this.length = 10;
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
				this.y = -10;
				if(this.speed > terminalvelocity)
					this.speed = terminalvelocity;
			}
		}
		if (this.falling) {
		 	stroke(255);
		 	line(this.x, this.y, this.x + this.windpower, this.y + this.speed);
 		}
 	};

	this.wind = function(){
		this.windpower = -(width/2-mouseX)/100;
	}

	this.fall = function() {
		//wind
		this.speed = this.speed + gravity;
		this.x = this.x + this.windpower;
		this.y = this.y + this.speed;

		if(this.y > height && this.falling){
			resetRain(this,height)
		} else {
			if(collisionRain(this.x,this.y) && this.falling) {
				resetRain(this,this.y);
			}
		}
		if(this.x > width){
			this.x = 0;
		}
		if(this.x < 0){
			this.x = width;
		}
  };
}

function collisionRain(x,y) {
	if(x > mouseX - (mousesize/2) && x < mouseX + (mousesize/2) && y > mouseY && y < mouseY + mousesize) {
		return true //if hit
	} else {
		return false;
	}
}

function resetRain(that,splashlocy){
	that.splash = true;
	that.falling = false;
	that.splashlocy = splashlocy;
	that.splashlocx = that.x;
	that.x = that.x = random(width);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
	for (let i = 0; i < raindrops.length; i++) {
		raindrops[i].speed = random(0, 2);
    raindrops[i].x = random(width);
	  raindrops[i].y = random(-10, -height);
  }
}
