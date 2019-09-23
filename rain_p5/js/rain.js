let raindrops = [];
let gravity = 0.1;
let terminalvelocity = 20;
let rainy = 240;

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
  this.w = 30;
  this.h = 15;
  this.length = 10;
  this.speed = random(0, 2);
  this.endY = random(200, 300);
	this.falling = true;
	this.splash = false;
	this.splashloc = 0;
	this.splashprocess = 0;
	this.windpower = 10;
	//this.zindex = random(0.8,1.2);

	this.show = function() {
		if (this.splash) {
			stroke(255);
		 	line(this.splashloc, height, this.splashloc - random(4,11), height - random(5,10));
			line(this.splashloc, height, this.splashloc, height - random(10,16));
			line(this.splashloc, height, this.splashloc + random(4,11), height - random(5,10));
			fill(color(0));
			noStroke();
			circle(this.splashloc, height, this.splashprocess);
			this.splashprocess = this.splashprocess + 1;
			if(this.splashprocess>16){
				this.splash=false;
				this.splashprocess = 0;
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
		this.x = this.x + this.windpower;

    this.speed = this.speed + gravity;
		this.y = this.y + this.speed;
		if(this.y > height){
			this.splash = true;
			this.splashloc = this.x;
			this.y = -10;
			this.x = this.x = random(width);
			if(this.speed > terminalvelocity)
				this.speed=terminalvelocity;
		}
		if(this.x > width){
			this.x = 0;
		}
		if(this.x < 0){
			this.x = width;
		}
  };

}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
