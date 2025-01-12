export class Particle {
  constructor(x, y, color, trailLength = 0) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.tail = trailLength > 0 ? new Array(trailLength) : null;
    this.trailLength = trailLength;
    this.tailIndex = 0;

    if (this.tail) {
      for (let i = 0; i < trailLength; i++) {
        this.tail[i] = { x, y };
      }
    }
  }

  update(initConds, speed) {
    const spd = speed / 100;

    if (this.tail) {
      this.tail[this.tailIndex].x = this.x;
      this.tail[this.tailIndex].y = this.y;
      this.tailIndex = (this.tailIndex + 1) % this.trailLength;
    }

    const {
      romeo: [a, b],
      juliet: [c, d],
    } = initConds;

    // Center the particle coordinates
    const r = this.x - width / 2;
    const j = height / 2 - this.y;

    // Compute vector components based on field equations
    const dr = a * r + b * j;
    const dj = c * r + d * j;

    // Update position based on speed
    this.x += dr * spd;
    this.y -= dj * spd;
  }

  show() {
    push();
    if (!this.tail) {
      point(this.x, this.y);
      return;
    }

    noFill();
    beginShape(LINES);
    let idx = this.tailIndex;
    for (let i = 0; i < this.trailLength - 1; i++) {
      const current = this.tail[idx];
      idx = (idx + 1) % this.trailLength;
      const next = this.tail[idx];
      vertex(current.x, current.y);
      vertex(next.x, next.y);
    }
    endShape();
    pop();
  }
}
