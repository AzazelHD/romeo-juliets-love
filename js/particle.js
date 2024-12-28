export class Particle {
  constructor(x, y, color, radius = 5, trailLength = 0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.trailLength = trailLength;
    this.tail = new Float32Array(trailLength * 2);
    this.currentSize = 0;
    this.startIndex = 0;
  }

  update(dx, dy) {
    // Update position
    this.x += dx;
    this.y += dy;

    // Calculate the index to store the new point
    const insertIndex = (this.startIndex + this.currentSize * 2) % (this.trailLength * 2);
    this.tail[insertIndex] = this.x; // Store x
    this.tail[insertIndex + 1] = this.y; // Store y

    if (this.currentSize < this.trailLength) {
      // If the buffer isn't full, increase the size
      this.currentSize++;
    } else {
      // If the buffer is full, shift the start index forward
      this.startIndex = (this.startIndex + 2) % (this.trailLength * 2);
    }
  }

  show() {
    // Draw the trail
    noFill();
    stroke(this.color, 150); // Semi-transparent stroke
    strokeWeight(this.radius * 0.5);
    beginShape(LINES);

    for (let i = 0; i < this.currentSize - 1; i++) {
      // Get the current and next indices in the circular buffer
      const currentIndex = (this.startIndex + i * 2) % (this.trailLength * 2);
      const nextIndex = (currentIndex + 2) % (this.trailLength * 2);

      // Retrieve the coordinates
      const x1 = this.tail[currentIndex];
      const y1 = this.tail[currentIndex + 1];
      const x2 = this.tail[nextIndex];
      const y2 = this.tail[nextIndex + 1];

      vertex(x1, -y1);
      vertex(x2, -y2);
    }
    endShape();

    // Draw the particle
    fill(this.color);
    noStroke();
    circle(this.x, -this.y, this.radius * 2);
  }
}
