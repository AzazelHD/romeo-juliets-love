export class Particle {
  constructor(x, y, color, trailLength = 0) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.tail = trailLength > 0 ? new Array(trailLength) : null;
    this.trailLength = trailLength;
    this.tailIndex = 0;
    // Pre-allocate tail
    if (this.tail) {
      for (let i = 0; i < trailLength; i++) {
        this.tail[i] = { x, y };
      }
    }
    console.log(trailLength);
  }

  update(a, b, c, d, speed) {
    if (this.tail) {
      this.tail[this.tailIndex].x = this.x;
      this.tail[this.tailIndex].y = this.y;
      this.tailIndex = (this.tailIndex + 1) % this.trailLength;
    }

    this.x += (a * this.x + b * this.y) * speed;
    this.y += (c * this.x + d * this.y) * speed;
  }

  show() {
    push();
    strokeWeight(2);
    if (!this.tail) {
      point(this.x, -this.y);
      return;
    }

    noFill();
    beginShape();
    let idx = this.tailIndex;
    for (let i = 0; i < this.trailLength - 1; i++) {
      const current = this.tail[idx];
      idx = (idx + 1) % this.trailLength;
      const next = this.tail[idx];
      vertex(current.x, -current.y);
      vertex(next.x, -next.y);
    }
    endShape();
    pop();
  }
}
