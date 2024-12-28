export class Particle {
  constructor(x, y, color, radius = 5, trailLength = 0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  update(dx, dy) {
    // Update position
    this.x += dx;
    this.y += dy;
  }

  show() {
    point(this.x, -this.y);
  }
}
