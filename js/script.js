import { Particle } from "./particle.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/*
dR/dt = aR + bJ
dJ/dt = cR + dJ
*/

//types of different initial states
const cautious = {
  romeo: { love: 1, a: 0, b: 1 },
  juliet: { love: 1, c: -1, d: 0 },
};
const hermit = {
  romeo: { love: 1, a: 1, b: 1 },
  juliet: { love: 1, c: 1, d: 1 },
};

const $a = $("#a");
const $b = $("#b");
const $c = $("#c");
const $d = $("#d");
const $dt = $("#dt");
const $reset = $("#reset");
const $play = $("#play");

let a, b, c, d;

let dt = 0.01;
let paused = true;

let points = [];
let vectorCache = [];

const steps = 50;

function setup() {
  background(20);
  createCanvas(windowWidth, windowHeight, WEBGL, $("#canvas"));
  setupInputs();
  initInputs(cautious);
  computeVectorField(steps);
  randomizePoints();
}

function draw() {
  background(20);
  stroke(255);
  strokeWeight(1);
  line(-width / 2, 0, width / 2, 0);
  line(0, -height / 2, 0, height / 2);

  drawVectorField();
  console.log(frameRate());

  noFill();
  stroke(255, 100, 100, 80);
  strokeWeight(5);
  beginShape(POINTS);
  for (let p of points) {
    // vertex(p.x, -p.y);
    // p.x += (a * p.x + b * p.y) * dt;
    // p.y += (c * p.x + d * p.y) * dt;
    p.show();
    p.update((a * p.x + b * p.y) * dt, (c * p.x + d * p.y) * dt);
  }
  endShape();
}

function drawVectorField() {
  beginShape(LINES);
  for (const vector of vectorCache) {
    const { tail, arrow } = vector;
    // Draw the main vector line
    vertex(tail.x, tail.y);
    vertex(tail.x + tail.normDr, tail.y - tail.normDj);
    // Draw the arrowhead
    triangle(arrow.endX, arrow.endY, arrow.leftX, arrow.leftY, arrow.rightX, arrow.rightY);
  }
  endShape();
}

function updateVectorField(cols = 10, maxMagnitude = 15) {
  vectorCache = [];
  background(20);
  stroke(255);
  strokeWeight(1);
  line(-width / 2, 0, width / 2, 0);
  line(0, -height / 2, 0, height / 2);
  computeVectorField(cols, maxMagnitude);
  drawVectorField();
}

function computeVectorField(cols = 10, maxMagnitude = 15) {
  const offset = cols / 2;
  const xStart = -Math.floor(width / 2 / cols) * cols - offset;
  const yStart = -Math.floor(height / 2 / cols) * cols - offset;

  const arrowSize = 5;

  for (let y = yStart; y <= height / 2; y += cols) {
    for (let x = xStart; x <= width / 2; x += cols) {
      const r = x;
      const j = -y;

      const dr = a * r + b * j;
      const dj = c * r + d * j;

      let normDr = dr;
      let normDj = dj;

      // Calculate the magnitude of the vector
      const magnitudeSq = normDr * normDr + normDj * normDj;
      const maxMagnitudeSq = maxMagnitude * maxMagnitude;

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
      const leftX = endX - arrowSize * Math.cos(angle + Math.PI / 6);
      const leftY = endY - arrowSize * Math.sin(angle + Math.PI / 6);
      const rightX = endX - arrowSize * Math.cos(angle - Math.PI / 6);
      const rightY = endY - arrowSize * Math.sin(angle - Math.PI / 6);

      vectorCache.push({
        tail: { x, y, normDr, normDj },
        arrow: { endX, endY, leftX, leftY, rightX, rightY },
      });
    }
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
    dt = Number($dt.value);
  });

  $play.addEventListener("click", resume);

  $reset.addEventListener("click", reset);
}

function initInputs(initialConditions) {
  $a.value = a = initialConditions.romeo.a;
  $b.value = b = initialConditions.romeo.b;
  $c.value = c = initialConditions.juliet.c;
  $d.value = d = initialConditions.juliet.d;
  $dt.value = dt;

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

function randomizePoints(size = 100) {
  for (let i = 0; i < size; i++) {
    const romeo = Math.random() - 0.5;
    const juliet = Math.random() - 0.5;
    // points[i]={ x: romeo * width, y: juliet * height };
    points[i] = new Particle(romeo * width, juliet * height, color(255, 100, 100, 80));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {}

function mouseReleased() {}

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
