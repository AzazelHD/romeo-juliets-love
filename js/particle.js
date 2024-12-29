export class Particle {
  constructor(x, y, color, radius = 5, trailLength = 10) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.tail = [];
    this.trailLength = trailLength;
  }

  update(a, b, c, d, speed) {
    this.tail.push({ x: this.x, y: this.y });
    if (this.tail.length > this.trailLength) this.tail.shift();
    this.x += (a * this.x + b * this.y) * speed;
    this.y += (c * this.x + d * this.y) * speed;
  }

  show() {
    // point(this.x, -this.y);
    noFill();
    beginShape();
    for (let i = 0; i < this.tail.length - 1; i++) {
      const x = this.tail[i].x;
      const y = this.tail[i].y;
      const nextX = this.tail[i + 1].x;
      const nextY = this.tail[i + 1].y;
      vertex(x, -y);
      vertex(nextX, -nextY);
    }
    endShape();
  }
}
