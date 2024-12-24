export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

/*
dR/dt = aR + bJ
dJ/dt = cR + dJ
*/

let points = [];
//types of different initial states
const cautious = {
  romeo: { love: 1, a: 0.5, b: 0.5 },
  juliet: { love: 1, c: -0.5, d: 0.5 },
};
const hermit = {
  romeo: { love: 1, a: 0.5, b: 0.5 },
  juliet: { love: 1, c: 0.5, d: 0.5 },
};

let romeo = 1;
let juliet = 1;

const $a = $("#a");
const $b = $("#b");
const $c = $("#c");
const $d = $("#d");
const $reset = $("#reset");
const $play = $("#play");

let a = Number($a.value);
let b = Number($b.value);
let c = Number($c.value);
let d = Number($d.value);

let dt = 0.05;
let paused = true;

const steps = 30;
const scale = 1 / 30;

function setup() {
  createCanvas(windowWidth, windowHeight, P2D, $("#canvas"));
  $play.addEventListener("click", resume);
  $reset.addEventListener("click", resetInputs);
  setupInputs();
  initInputs(hermit);
}

function draw() {
  console.log(frameRate());
  background(20);
  stroke(255);
  strokeWeight(1);
  translate(width / 2, height / 2);

  // Draw axes
  line(-width / 2, 0, width / 2, 0);
  line(0, -height / 2, 0, height / 2);

  drawVectorField(steps, scale);

  // Simulate a single trajectory
  noFill();
  stroke(255);
  beginShape();
  for (let p of points) {
    vertex(p.x, -p.y);
  }
  endShape();

  romeo += (a * romeo + b * juliet) * dt;
  juliet += (c * romeo + d * juliet) * dt;
  points.push({ x: romeo * 50, y: juliet * 50 });

  if (points.length > 500) points.shift();
}

function drawVectorField(steps, scale) {
  const xStart = -Math.floor(width / 2) * steps;
  const yStart = -Math.floor(height / 2) * steps;

  for (let x = xStart; x <= width / 2; x += steps) {
    for (let y = yStart; y <= height / 2; y += steps) {
      const r = x;
      const j = -y;

      const dr = a * r + b * j;
      const dj = c * r + d * j;

      const normDr = Math.min(dr * scale, 10);
      const normDj = Math.min(dj * scale, 10);

      stroke(150);
      line(x, y, x + normDr, y - normDj);
    }
  }
}

function updateVectorField() {
  clear(); // Clear canvas for a clean redraw
  background(20);

  // Redraw axes
  stroke(255);
  strokeWeight(1);
  line(-width / 2, 0, width / 2, 0);
  line(0, -height / 2, 0, height / 2);

  // Draw updated vector field
  drawVectorField();
}

function setupInputs() {
  $a.addEventListener("input", () => {
    a = Number($a.value);
    updateVectorField();
  });
  $b.addEventListener("input", () => {
    b = Number($b.value);
    updateVectorField();
  });
  $c.addEventListener("input", () => {
    c = Number($c.value);
    updateVectorField();
  });
  $d.addEventListener("input", () => {
    d = Number($d.value);
    updateVectorField();
  });
}

function initInputs(initialConditions) {
  romeo = initialConditions.romeo.love;
  juliet = initialConditions.juliet.love;
  $a.value = a = initialConditions.romeo.a;
  $b.value = b = initialConditions.romeo.b;
  $c.value = c = initialConditions.juliet.c;
  $d.value = d = initialConditions.juliet.d;

  points = [];
  noLoop();
}

function resetInputs() {
  $play.innerText = "Start";
  // $a.value = $d.value = "0";
  // $b.value = "1";
  // $c.value = "-1";

  // a = d = 0;
  // b = 1;
  // c = -1;
  romeo = 1;
  juliet = 1;
  points = [];
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

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
