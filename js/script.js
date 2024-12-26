const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/*
dR/dt = aR + bJ
dJ/dt = cR + dJ
*/

let points = [];

//types of different initial states
const cautious = {
  romeo: { love: 1, a: 0, b: 1 },
  juliet: { love: 1, c: -1, d: 0 },
};
const hermit = {
  romeo: { love: 1, a: 1, b: 1 },
  juliet: { love: 1, c: 1, d: 1 },
};

let romeo = 1;
let juliet = 1;

const $a = $("#a");
const $b = $("#b");
const $c = $("#c");
const $d = $("#d");
const $dt = $("#dt");
const $reset = $("#reset");
const $play = $("#play");

let a = Number($a.value);
let b = Number($b.value);
let c = Number($c.value);
let d = Number($d.value);

let dt = 0.01;
let paused = true;

let vectorCache = [];

const steps = 50;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL, $("#canvas"));
  $play.addEventListener("click", resume);
  $reset.addEventListener("click", resetInputs);
  setupInputs();
  initInputs(cautious);
  computeVectorField(steps);
}

function draw() {
  background(20);
  stroke(255);
  strokeWeight(1);
  line(-width / 2, 0, width / 2, 0);
  line(0, -height / 2, 0, height / 2);

  drawVectorField();
  console.log(vectorCache);
  console.log(frameRate());

  noFill();
  stroke(255, 100, 100, 90);
  strokeWeight(3);
  beginShape();
  for (let p of points) {
    vertex(p.x * steps, -p.y * steps);
  }
  endShape();

  romeo += (a * romeo + b * juliet) * dt;
  juliet += (c * romeo + d * juliet) * dt;

  points.push({ x: romeo, y: juliet });

  if (points.length > 100) points.shift();
}

function drawVectorField() {
  for (const vector of vectorCache) {
    const { line, arrow } = vector;

    // Draw the main vector line
    beginShape(LINES);
    vertex(line.x, line.y);
    vertex(line.x + line.normDr, line.y - line.normDj);
    endShape();

    // Draw the arrowhead
    triangle(arrow.endX, arrow.endY, arrow.leftX, arrow.leftY, arrow.rightX, arrow.rightY);
  }
}

function updateVectorField(steps = 50, maxMagnitude = 15) {
  vectorCache = [];
  background(20);
  stroke(255);
  strokeWeight(1);
  line(-width / 2, 0, width / 2, 0);
  line(0, -height / 2, 0, height / 2);
  computeVectorField(steps, maxMagnitude);
  drawVectorField();
}

function computeVectorField(steps = 50, maxMagnitude = 15) {
  const offset = steps / 2;
  const xStart = -Math.floor(width / 2 / steps) * steps - offset;
  const yStart = -Math.floor(height / 2 / steps) * steps - offset;

  const arrowSize = 5;

  for (let y = yStart; y <= height / 2; y += steps) {
    for (let x = xStart; x <= width / 2; x += steps) {
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

      const angle = Math.atan2(-normDj, normDr); // Negative because y-coordinates are inverted
      const leftX = endX - arrowSize * Math.cos(angle + Math.PI / 6);
      const leftY = endY - arrowSize * Math.sin(angle + Math.PI / 6);
      const rightX = endX - arrowSize * Math.cos(angle - Math.PI / 6);
      const rightY = endY - arrowSize * Math.sin(angle - Math.PI / 6);

      vectorCache.push({
        line: { x, y, normDr, normDj },
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
