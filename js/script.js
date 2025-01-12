import { Particle } from "./particle.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/*
dR/dt = aR + bJ + [cRJ] [optional]
dJ/dt = dR + eJ + [fRJ] [optional]
*/

// Eager-beaver: a,b > 0
// Narcissistic: a > 0, b < 0
// Cautious: a < 0, b > 0
// Hermit: a,b < 0
function scenarios(a, b) {
  return {
    fire_ice: [-b, -a],
  };
}

// Fire & Ice: c = -b, a = -d
// Eigen values = ± sqrt(a^2 - b^2)

// Case 1: a^2 - b^2 > 0 => real eigen values
// |a| > |b| => -sqrt(a^2 - b^2) < 0 < sqrt(a^2 - b^2)
const romeo_coefs = [2, 1];
const juliet_coefs = scenarios(...romeo_coefs).fire_ice;

// a > b > 0
// Romeo: Eager beaver
// Juliet: Hermit

// a > 0 > b
// Romeo: Narcissistic
// Juliet: Cautious

// *************************************************** //

// Case 2: a^2 - b^2 < 0 => complex eigen values
// |a| < |b| => ± sqrt(a^2 - b^2) = ± i sqrt(b^2 - a^2)
// sines and cosines (Euler's formula)

// b > a > 0
// Romeo: Eager beaver
// Juliet: Hermit

// a > 0 > b
// Romeo: Narcissistic
// Juliet: Cautious

const PI_6 = Math.PI / 6;

let HALF_WIDTH, HALF_HEIGHT;

const $a = $("#a");
const $b = $("#b");
// const $c = $("#c");
const $d = $("#d");
const $e = $("#e");
// const $f = $("#f");
const $speed = $("#speed");
const $reset = $("#reset");
const $play = $("#play");

let speed = 0.1;
let paused = true;

let points = [];
let vectorCache = [];

const n = 100;
const trail = 0;
const steps = 50;

const maxSamples = 40;
const samples = new Array(50).fill(0);
let sum = 0;
let sampleIndex = 0;

function preload() {}

function setup() {
  createCanvas(windowWidth, windowHeight, P2D, $("#canvas"));
  HALF_WIDTH = width / 2;
  HALF_HEIGHT = height / 2;
  background(20);
  initInputs();
  randomizePoints(n, trail);
  computeVectorField(steps);
  noLoop();
}

function draw() {
  mainBG();
  drawVectorField();
  console.log("drawing");
  stroke(255, 100, 100, 80);
  strokeWeight(5);
  for (let p of points) {
    p.show();
    // p.update(initConds.fire_ice, speed);
  }

  const rate = frameRate();
  if (isFinite(rate)) {
    sum = sum - samples[sampleIndex] + rate;
    samples[sampleIndex] = rate;
    sampleIndex = (sampleIndex + 1) % maxSamples;
  }
  console.log("Avg FPS", sum / samples.length);
}

function drawVectorField() {
  beginShape(LINES);
  for (const vector of vectorCache) {
    const { tail, arrow } = vector;
    vertex(tail.x, tail.y);
    vertex(tail.x + tail.normDr, tail.y - tail.normDj);

    triangle(arrow.endX, arrow.endY, arrow.leftX, arrow.leftY, arrow.rightX, arrow.rightY);
  }
  endShape();
}

function computeVectorField(steps = 20, maxMagnitude = 15) {
  vectorCache.length = 0;

  const arrowSize = 5;
  const maxMagnitudeSq = maxMagnitude * maxMagnitude;

  const xStart = Math.floor(-HALF_WIDTH / steps) * steps - steps / 2;
  const yStart = Math.floor(-HALF_HEIGHT / steps) * steps - steps / 2;

  // Iterate over the grid, spanning symmetrically around the center
  for (let y = yStart; y <= height - HALF_HEIGHT; y += steps) {
    for (let x = xStart; x <= width - HALF_WIDTH; x += steps) {
      const screenX = HALF_WIDTH + x;
      const screenY = HALF_HEIGHT + y;

      // Compute the vector field relative to the canvas center
      const r = x;
      const j = -y;

      const [a, b] = romeo_coefs;
      const [c, d] = juliet_coefs;

      const dr = a * r + b * j;
      const dj = c * r + d * j;

      const magnitudeSq = dr * dr + dj * dj;
      let normDr = dr;
      let normDj = dj;

      // Normalize the vector if its magnitude exceeds the maximum allowed value
      if (magnitudeSq > maxMagnitudeSq) {
        const scale = Math.sqrt(maxMagnitudeSq / magnitudeSq);
        normDr *= scale;
        normDj *= scale;
      }

      // Precompute arrowhead geometry
      const endX = screenX + normDr;
      const endY = screenY - normDj;
      const angle = Math.atan2(-normDj, normDr);

      const cos1 = Math.cos(angle + PI_6);
      const cos2 = Math.cos(angle - PI_6);
      const sin1 = Math.sin(angle + PI_6);
      const sin2 = Math.sin(angle - PI_6);

      vectorCache.push({
        tail: { x: screenX, y: screenY, normDr, normDj },
        arrow: {
          endX,
          endY,
          leftX: endX - arrowSize * cos1,
          leftY: endY - arrowSize * sin1,
          rightX: endX - arrowSize * cos2,
          rightY: endY - arrowSize * sin2,
        },
      });
    }
  }
}

function updateVectorField(steps = 20, maxMagnitude = 15) {
  vectorCache.length = 0;
  mainBG();
  computeVectorField(steps, maxMagnitude);
  drawVectorField();
}

function randomizePoints(size = 100, trailLength = 0) {
  points.length = 0;
  let x, y;
  for (let i = 0; i < size; i++) {
    x = Math.random() * width;
    y = Math.random() * height;
    points[i] = new Particle(x, y, color(255, 100, 100, 80), trailLength);
  }
}

function setupInputs() {
  $a.addEventListener("input", () => {
    romeo_coefs[0] = Number($a.value);
    updateVectorField(steps);
  });
  $b.addEventListener("input", () => {
    romeo_coefs[1] = Number($b.value);
    updateVectorField(steps);
  });
  $d.addEventListener("input", () => {
    juliet_coefs[0] = Number($d.value);
    updateVectorField(steps);
  });
  $e.addEventListener("input", () => {
    juliet_coefs[1] = Number($e.value);
    updateVectorField(steps);
  });
  $speed.addEventListener("input", () => {
    console.log($speed.value);
    speed = Number($speed.value);
  });

  $play.addEventListener("click", resume);

  $reset.addEventListener("click", reset);
}

function initInputs() {
  setupInputs();
  [$a.value, $b.value] = romeo_coefs;
  [$d.value, $e.value] = juliet_coefs;
  $speed.value = speed;
}

function reset() {
  $play.innerText = "Start";
  randomizePoints(n, trail);
  paused = true;
  redraw();
  noLoop();
}

function resume() {
  paused = !paused;
  if (paused) {
    $play.innerText = "Resume";
    noLoop();
  } else {
    $play.innerText = "Pause";
    loop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  HALF_WIDTH = width / 2;
  HALF_HEIGHT = height / 2;
  mainBG();
  updateVectorField(steps);
}

function mainBG() {
  background(20);
  stroke(255);
  strokeWeight(1);
  line(width / 2, 0, width / 2, height);
  line(0, height / 2, width, height / 2);
}

function mousePressed() {}

function mouseReleased() {}

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
