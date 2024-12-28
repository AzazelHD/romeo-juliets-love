export class Particle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.tail = [];
  }
  update(x, y) {
    this.tail.push({ x: this.x, y: this.y });
    this.x += x;
    this.y += y;
    if (this.tail.length > 100) {
      this.tail.shift();
    }
  }
  show() {
    fill(this.color);
    strokeWeight(this.radius);
    beginShape();
    this.tail.forEach((point) => {
      vertex(point.x, point.y);
    });
    endShape();
  }
}
