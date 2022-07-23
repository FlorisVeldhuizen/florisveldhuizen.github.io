let i = 0;

setup = () => {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  background(255);
}

draw = () => {
  i += 0.2;
  drawWavyCircle();
}

const drawWavyCircle = (x, y) => {

  circle(windowWidth/2 + sin(i)*40, windowHeight/2 + 184, 220);
}
