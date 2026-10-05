export class Spring {
  constructor(stiffness, damping, value = 0) {
    this.k = stiffness;
    this.c = damping;
    this.x = value;
    this.target = value;
    this.v = 0;
  }

  step(dt) {
    const steps = Math.ceil(dt / (1 / 240));
    const h = dt / steps;
    for (let n = 0; n < steps; n += 1) {
      this.v += (this.k * (this.target - this.x) - this.c * this.v) * h;
      this.x += this.v * h;
    }
  }

  wrap(period) {
    if (this.target < period || this.x < period) return;
    this.target -= period;
    this.x -= period;
  }
}
