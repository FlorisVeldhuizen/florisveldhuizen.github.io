import $ from "jquery";

// some global variables:
let _width = 1900;
let _height = 900;
const threshold = 300;
let mousePositionX;
let mousePositionY;
const zoomSpeed = 0.0005;

// Custom pixi filter in order to compute the fractal on the gpu
PIXI.FractalFilter = function () {
  PIXI.AbstractFilter.call(this);

  this.passes = [this];

  this.uniforms = {
    resolution: { type: "2f", value: { x: _width, y: _height } },
    minSet: { type: "2f", value: { x: -2.5, y: -1 } },
    maxSet: { type: "2f", value: { x: 1, y: 1 } },
    threshold: { type: "1f", value: threshold },
  };

  this.fragmentSrc = [
    "precision highp float;",
    "uniform vec2 resolution;",
    "uniform vec2 minSet;",
    "uniform vec2 maxSet;",
    "uniform float threshold;",
    "uniform float animator;",

    "void main(void) {",
    "vec2 ss = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y/resolution.y);",
    "vec2 scaledPosition = vec2((gl_FragCoord.x / resolution.x) * (maxSet.x - minSet.x) + minSet.x, (gl_FragCoord.y / resolution.y) * (maxSet.y - minSet.y) + minSet.y);",
    "vec2 newPosition = vec2(0.,0.);",
    "float counter = 0.;",
    "bool escaped = false;",
    "for(int i=0; i < 10000; i++){",
    "if(newPosition.x * newPosition.x + newPosition.y * newPosition.y > 2.*2. || float(i) > threshold){",
    "counter = float(i);",
    "escaped = true;",
    "break;",
    "}",
    "float xTemp = newPosition.x * newPosition.x - newPosition.y * newPosition.y + scaledPosition.x;",
    "newPosition.y = 2.*newPosition.x*newPosition.y+scaledPosition.y;",
    "newPosition.x = xTemp;",
    "}",
    "gl_FragColor = escaped ? vec4(vec3(255.*(counter/10000.)), 1.0) : vec4(0.,255.,0., 1.0);",
    "}",
  ];
};

PIXI.FractalFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
PIXI.FractalFilter.prototype.constructor = PIXI.FractalFilter;

const stage = new PIXI.Stage(0x663300);
const renderer = PIXI.autoDetectRenderer(_width, _height);
const fractal = new PIXI.Sprite();
const FractalFilter = new PIXI.FractalFilter();

fractal.position.x = 0;
fractal.position.y = 0;
fractal.width = _width;
fractal.height = _height;
fractal.filters = [FractalFilter];
stage.addChild(fractal);

let scrollZoom = 0;
let oldMousePosition = { x: 0, y: 0 };
let newMousePosition = { x: 0, y: 0 };
let currentPosition = { x: 0, y: 0 };
let stageDragging = false;

$(function () {
  document.body.appendChild(renderer.view);

  requestAnimationFrame(animate);
  function animate() {
    newMousePosition = currentPosition;
    // do things with mouse position

    const xLength =
      FractalFilter.uniforms.maxSet.value.x -
      FractalFilter.uniforms.minSet.value.x;
    const yLength =
      FractalFilter.uniforms.maxSet.value.y -
      FractalFilter.uniforms.minSet.value.y;

    if (stageDragging) {
      const xMovement = (newMousePosition.x - oldMousePosition.x) / _width;
      const yMovement = (newMousePosition.y - oldMousePosition.y) / _height;

      FractalFilter.uniforms.minSet.value.x -= xLength * xMovement;
      FractalFilter.uniforms.minSet.value.y += yLength * yMovement;
      FractalFilter.uniforms.maxSet.value.x -= xLength * xMovement;
      FractalFilter.uniforms.maxSet.value.y += yLength * yMovement;
    }

    // animate by zooming in towards mouse cursor
    if (stage.getMousePosition().x > 0) {
      mousePositionX = stage.getMousePosition().x / _width;
      mousePositionY = stage.getMousePosition().y / _height;
    }
    const setRatio = xLength / yLength;
    if (stage.getMousePosition().x) {
      FractalFilter.uniforms.minSet.value.x +=
        xLength * scrollZoom * mousePositionX;
      FractalFilter.uniforms.minSet.value.y +=
        yLength * scrollZoom * (1 - mousePositionY);
      FractalFilter.uniforms.maxSet.value.x -=
        xLength * scrollZoom * (1 - mousePositionX);
      FractalFilter.uniforms.maxSet.value.y -=
        yLength * scrollZoom * mousePositionY;
    }

    requestAnimationFrame(animate);
    renderer.render(stage);
    scrollZoom *= 0.8;
    oldMousePosition = newMousePosition;
  }
  // Panning
  stage.mousedown = function () {
    stageDragging = true;
  };
  stage.touchstart = function (e) {
    currentPosition = {
      x: e.getLocalPosition(fractal).x * _width,
      y: e.getLocalPosition(fractal).y * _height,
    };
    newMousePosition = currentPosition;
    oldMousePosition = currentPosition;
    stageDragging = true;
  };

  stage.mouseup = function () {
    stageDragging = false;
  };
  stage.mouseout = function () {
    stageDragging = false;
  };
  stage.touchend = function () {
    stageDragging = false;
  };

  stage.mousemove = function (e) {
    currentPosition = {
      x: e.getLocalPosition(fractal).x * _width,
      y: e.getLocalPosition(fractal).y * _height,
    };
  };

  stage.touchmove = function (e) {
    currentPosition = {
      x: e.getLocalPosition(fractal).x * _width,
      y: e.getLocalPosition(fractal).y * _height,
    };
  };
});

function resizeHandler(e) {
  _width = $(document).width();
  _height = $(document).height();
  FractalFilter.uniforms.resolution.value.x = _width;
  FractalFilter.uniforms.resolution.value.y = _height;
  fractal.width = _width;
  fractal.height = _height;
  renderer.resize(_width, _height);
}

$(window).on("resize", resizeHandler);

resizeHandler();

document.addEventListener("wheel", (e) => {
  scrollZoom -= e.deltaY / 10000;
});
