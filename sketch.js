// Environnement settings
const ENV = {
  canvasWidth: 400,
  canvasHeight: 400,
  population: 50,
};

const population = [];

const DIRECTIONS = {
  STAND: 0,
  FORWARD: 1,
  BACKWARD: -1,
};

class Cell {
  constructor(
    settings = {
      x: 0,
      y: 0,
      xDirection: 0,
      yDirection: 0,
      speed: 1,
      size: 10,
    }
  ) {
    this.x = settings.x;
    this.y = settings.y;
    this.xDirection = settings.xDirection;
    this.yDirection = settings.yDirection;
    this.speed = settings.speed;
    this.size = settings.size;
  }

  move() {
    if (this.xDirection === DIRECTIONS.STAND)
      this.xDirection = DIRECTIONS.FORWARD;
    if (this.yDirection === DIRECTIONS.STAND)
      this.yDirection = DIRECTIONS.FORWARD;

    // collision detection
    const nextX = this.x + this.speed * this.xDirection;
    const nextY = this.y + this.speed * this.yDirection;
    const xOverflow = nextX < 0 || nextX > width;
    const yOverflow = nextY < 0 || nextY > height;

    if (xOverflow) this.xDirection = -this.xDirection;
    if (yOverflow) this.yDirection = -this.yDirection;

    this.x = this.x + this.speed * this.xDirection;
    this.y = this.y + this.speed * this.yDirection;
  }

  setRandomPosition() {
    this.x = random(this.size, width - this.size);
    this.y = random(this.size, height - this.size);
    this.xDirection = random() > 0.5 ? DIRECTIONS.FORWARD : DIRECTIONS.BACKWARD;
    this.yDirection = random() > 0.5 ? DIRECTIONS.FORWARD : DIRECTIONS.BACKWARD;
  }

  getDistance(other) {
    const x = this.x - other.x;
    const y = this.y - other.y;

    return Math.sqrt(x ** 2 + y ** 2);
  }
}

function setup() {
  createCanvas(ENV.canvasWidth, ENV.canvasHeight);

  // Create population
  for (let n = 0; n < ENV.population; n++) {
    const c = new Cell();

    c.setRandomPosition();

    population.push(c);
  }
}

function draw() {
  background(0);

  population.forEach((p) => {
    noStroke();
    ellipse(p.x, p.y, p.size, p.size);
    p.move();
  });

  for (let i = 0; i < population.length; i++) {
    const c = population[i];

    for (let j = 0; j < population.length; j++) {
      if (j === i) continue;

      const other = population[j];
    }
  }
}
