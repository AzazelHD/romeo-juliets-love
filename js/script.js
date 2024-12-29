import { Particle } from "./particle.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/*
dR/dt = aR + bJ
dJ/dt = cR + dJ
*/

//types of different initial states
const states = {
  cautious: {
    romeo: { love: 1, a: 0, b: 1 },
    juliet: { love: 1, c: -1, d: 0 },
  },
  hermit: {
    romeo: { love: 1, a: 1, b: 1 },
    juliet: { love: 1, c: 1, d: 1 },
  },
};

const $a = $("#a");
const $b = $("#b");
const $c = $("#c");
const $d = $("#d");
const $dt = $("#dt");
const $reset = $("#reset");
const $play = $("#play");

let a, b, c, d;

let speed = 0.01;
let paused = true;

let points = [];
let vectorCache = [];

const steps = 50;

const samples = new Array(40).fill(0);
let sampleIndex = 0;
let sum = 0;
const maxSamples = 40;

function preload() {}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL, $("#canvas"));
  background(20);
  setupInputs();
  initInputs(states.cautious);
  computeVectorField(steps);
  randomizePoints(100, 10);
  noLoop();
}

function draw() {
  background(20);
  stroke(255);
  strokeWeight(1);
  line(-width / 2, 0, width / 2, 0);
  line(0, -height / 2, 0, height / 2);
  drawVectorField();

  const rate = frameRate();
  if (isFinite(rate)) {
    sum = sum - samples[sampleIndex] + rate;
    samples[sampleIndex] = rate;
    sampleIndex = (sampleIndex + 1) % maxSamples;
  }
  console.log("Avg FPS", sum / samples.length);

  stroke(255, 100, 100, 80);
  strokeWeight(5);
  for (let p of points) {
    p.show();
    p.update(a, b, c, d, speed);
  }
}

function drawVectorField() {
  beginShape(LINES);
  for (const vector of vectorCache) {
    const { tail, arrow } = vector;
    vertex(tail.x, tail.y);
    vertex(tail.x + tail.normDr, tail.y - tail.normDj);
    // triangles = -10 fps
    triangle(arrow.endX, arrow.endY, arrow.leftX, arrow.leftY, arrow.rightX, arrow.rightY);
  }
  endShape();
}

function computeVectorField(steps = 20, maxMagnitude = 15) {
  vectorCache.length = 0;
  const offset = steps / 2;
  const xStart = -Math.floor(width / 2 / steps) * steps - offset;
  const yStart = -Math.floor(height / 2 / steps) * steps - offset;

  const arrowSize = 5;
  const maxMagnitudeSq = maxMagnitude * maxMagnitude;
  const PI_6 = Math.PI / 6;

  for (let y = yStart; y <= height / 2; y += steps) {
    for (let x = xStart; x <= width / 2; x += steps) {
      const r = x;
      const j = -y;

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
      const endX = x + normDr;
      const endY = y - normDj;
      const angle = Math.atan2(-normDj, normDr);

      const cos1 = Math.cos(angle + PI_6);
      const cos2 = Math.cos(angle - PI_6);
      const sin1 = Math.sin(angle + PI_6);
      const sin2 = Math.sin(angle - PI_6);

      vectorCache.push({
        tail: { x, y, normDr, normDj },
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

function updateVectorField(steps, maxMagnitude) {
  vectorCache.length = 0;
  background(20);
  stroke(255);
  strokeWeight(1);
  line(-width / 2, 0, width / 2, 0);
  line(0, -height / 2, 0, height / 2);
  computeVectorField(steps, maxMagnitude);
  drawVectorField();
}

function randomizePoints(size = 100, trailLength = 0) {
  points.length = 0;
  for (let i = 0; i < size; i++) {
    const romeo = Math.random() - 0.5;
    const juliet = Math.random() - 0.5;
    points[i] = new Particle(romeo * width, juliet * height, color(255, 100, 100, 80), trailLength);
  }
}

function setupInputs() {
  $a.addEventListener("input", () => {
    a = Number($a.value);
    updateVectorField(steps);
  });
  $b.addEventListener("input", () => {
    b = Number($b.value);
    updateVectorField(steps);
  });
  $c.addEventListener("input", () => {
    c = Number($c.value);
    updateVectorField(steps);
  });
  $d.addEventListener("input", () => {
    d = Number($d.value);
    updateVectorField(steps);
  });
  $dt.addEventListener("input", () => {
    speed = Number($dt.value);
  });

  $play.addEventListener("click", resume);

  $reset.addEventListener("click", reset);
}

function initInputs(initialConditions) {
  $a.value = a = initialConditions.romeo.a;
  $b.value = b = initialConditions.romeo.b;
  $c.value = c = initialConditions.juliet.c;
  $d.value = d = initialConditions.juliet.d;
  $dt.value = speed;

  points = [];
  noLoop();
}

function reset() {
  background(20);
  $play.innerText = "Start";
  // $a.value = $d.value = "0";
  // $b.value = "1";
  // $c.value = "-1";

  // a = d = 0;
  // b = 1;
  // c = -1;
  // dt = 0.01;
  // $dt.value = dt;
  randomizePoints();
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
}

function mousePressed() {}

function mouseReleased() {}

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
