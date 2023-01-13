/* eslint-disable max-classes-per-file */
let tree;

// Perlin noise offset
let yoff = 0;
let xoff = 0;

export const flexibility = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7];

setup = () => {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  background(116,89,97);

  tree = new Tree(windowWidth / 2 - 250, windowHeight / 2, 100, flexibility, 0.1, 0.1);
  tree2 = new Tree(windowWidth / 2 + 250, windowHeight / 2, 100, flexibility, 0.5, 0.1);
  trees = [tree, tree2];
  noStroke();
};

draw = () => {
  background(255,255,255,100);
  trees.forEach(treee => {
    treee.draw();
  })
  yoff += 0.005;
};

export class Tree {
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
          this.x + random(-this.radius, this.radius) * 0.15 * this.level,
          this.y + random(-this.radius, this.radius) * 0.15 * this.level,
        ]);
      }
    };
    setRandomBranchLocations();

    for (let l = 0; l < this.branches.length; l++) {
      this.leaves.push(
        new Leave(
          this.branches[l][0],
          this.branches[l][1],
          this.radius + (30 / this.level),
          this.level,
          this.flexibility
        )
      );
    }
  }

  draw() {
    xoff = this.level * 0.02;
    this.leaves.forEach((leave, index) => {
      const theta = map(noise(xoff + index, yoff), 0, 1, -PI/3, PI/3);
      leave.update(theta * 60, -theta * 60);
      leave.draw();
    });
  }
}

class Leave {
  constructor(x, y, radius, level, flexibility) {
    this.x = x + random(5, 10);
    this.y = y + random(5, 10);
    this.radius = radius;
    this.level = level;
    this.flexibility = flexibility; // * random(1, 2);
    this.offsetX = 0;
    this.offsetY = 0;
  }

  draw() {
    fill(0, 100 + this.level * 20, 0, 220);
    circle(
      this.x + this.offsetX,
      this.y + this.offsetY + random(0, 1),
      this.radius
    );
  }

  update(windX, windY) {
    this.offsetX = windX * this.flexibility;
    this.offsetY = windY * this.flexibility;
  }
}
