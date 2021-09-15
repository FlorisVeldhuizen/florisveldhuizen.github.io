import p5 from "p5"

const sketch = (p) => {
  /*
  Made by: Floris Veldhuizen
  */

  let raindrops = [];
  let gravity = 0.1;
  let terminalvelocity = 20;
  let rainy = 180;
  let mousesize = 100;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    for (let i = 0; i < rainy; i++) {
      raindrops.push(new Drop());
    }
  }

  p.draw = () => {
    p.background(0,0,0,100);
    for (let i = 0; i < raindrops.length; i++) {
      raindrops[i].wind();
      raindrops[i].fall();
      raindrops[i].show();
    }
  }

  function Drop(){
    this.x = p.random(p.width);
    this.y = p.random(-10, -p.height);
    this.speed = p.random(0, 2);
    this.falling = true;
    this.splash = false;
    this.splashlocx = 0;
    this.splashlocy = p.height;
    this.splashprocess = 0;
    this.windpower = 10;

    this.show = function() {
      if (this.splash) {
        p.stroke(255);
        p.line(this.splashlocx, this.splashlocy, this.splashlocx - p.random(4,11), this.splashlocy - p.random(5,10));
        p.line(this.splashlocx, this.splashlocy, this.splashlocx, this.splashlocy - p.random(10,16));
        p.line(this.splashlocx, this.splashlocy, this.splashlocx + p.random(4,11), this.splashlocy - p.random(5,10));
        p.fill(p.color(0));
        p.noStroke();
        p.circle(this.splashlocx, this.splashlocy, this.splashprocess);
        this.splashprocess++;
        if(this.splashprocess>16){
          this.splash = false;
          this.falling = true;
          this.splashprocess = 0;
        }
      }
      if (this.falling) {
        p.stroke(255);
        p.line(this.x, this.y, this.x + this.windpower, this.y + this.speed);
      }
    }

    this.fall = function() {
      if(this.falling){
        this.x = this.x + this.windpower;
        this.y = this.y + this.speed;
        this.speed = this.speed + gravity;
        if(this.y > p.height){
          resetRain(this,p.height);
        }
        else if(collisionRain(this.x,this.y)) {
          resetRain(this,this.y);
        }
        if(this.x > p.width){
          this.x = 0;
        }
        if(this.x < 0){
          this.x = p.width;
        }
      }
    }

    this.wind = function(){
      this.windpower = -(p.width/2-p.mouseX)/100;
    }
  }

  function collisionRain(x,y) {
    if(x > p.mouseX - (mousesize/2) && x < p.mouseX + (mousesize/2) && y > p.mouseY && y < p.mouseY + mousesize) {
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
    that.x = p.random(p.width);
    that.y = -10;
    if(that.speed > terminalvelocity)
      that.speed = terminalvelocity;
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    raindrops = [];
    for (let i = 0; i < rainy; i++) {
      raindrops.push(new Drop());
    }
  }
}

const sketchInstance = new p5(sketch);
