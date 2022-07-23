let windX = 0;
let windY = 0;
let test;
let tree;

const flexibility = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7];

setup = () => {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  background(255);
  tree = new Tree(windowWidth / 2, windowHeight / 2, 100, flexibility);
}

draw = () => {
  background(255);
  tree.draw();

  windX += 0.05;
  windY += 0.06;
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
    for(let i = 0; i < this.flexibilityArray.length; i++) {
      this.slices.push(new TreeSlice(this.x, this.y, this.size - (i * 10), i, this.flexibilityArray[i]));
    }
  }

  draw() {
    this.slices.forEach(slice => {
      slice.draw();
    });
  }
}

class TreeSlice {
  constructor(x, y, radius, level, flexibility) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.level = level;
    this.leaves = []
    this.flexibility = flexibility;
    this.setup();
  }

  setup() {
    for(let l = 0; l < this.level; l++){
      this.leaves.push(new Leave(this.x, this.y, this.radius, this.level, this.flexibility));
    }
  }

  draw(){
    this.leaves.forEach(leave => {
      leave.update(sin(windX)*40, cos(windY)*40);
      leave.draw()
    })
  }
}

class Leave {
  constructor(x, y, radius, level, flexibility) {
    this.x = x + random(0, 10);
    this.y = y + random(0, 10);
    this.radius = radius;
    this.level = level;
    this.flexibility = flexibility;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  draw() {
    fill(0, 100 + this.level * 20, 0);
    circle(this.x + this.offsetX , this.y + this.offsetY + random(0, 1), this.radius);
  }

  update(windX, windY) {
    this.offsetX = windX * this.flexibility;
    this.offsetY = windY * this.flexibility;
  }
}
