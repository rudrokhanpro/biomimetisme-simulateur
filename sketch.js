const DIRECTIONS = {
  STAND: 0,
  FORWARD: 1,
  BACKWARD: -1,
};
const COLORS = {
  RED: "#f00",
};

// Environnement settings
const ENV = {
  canvasWidth: 400,
  canvasHeight: 400,
  population: 50,
  contaminationRate: 0.2,
  contagiousness: 0.01,
  contaminationRadius: 10,
  contaminationColor: COLORS.RED,
};

const population = [];

class Cell {
  constructor(
    settings = {
      x: 0,
      y: 0,
      xDirection: 0,
      yDirection: 0,
      speed: 5,
      size: 10,
    }
  ) {
    this.x = settings.x;
    this.y = settings.y;
    this.xDirection = settings.xDirection;
    this.yDirection = settings.yDirection;
    this.speed = settings.speed;
    this.size = settings.size;
    this.contaminated = false;
  }

  move() {
    if (this.xDirection === DIRECTIONS.STAND)
      this.xDirection = DIRECTIONS.FORWARD;
    if (this.yDirection === DIRECTIONS.STAND)
      this.yDirection = DIRECTIONS.FORWARD;

    // collision detection
    const nextX = this.x + this.speed * this.xDirection;
    const nextY = this.y + this.speed * this.yDirection;
    const xOverflow =
      nextX < 0 + this.size / 2 || nextX > width - this.size / 2;
    const yOverflow =
      nextY < 0 + this.size / 2 || nextY > height - this.size / 2;

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

    return Math.sqrt(x ** 2 + y ** 2) - this.size / 2;
  }
}

let paused = false;

function setup() {
  createCanvas(ENV.canvasWidth, ENV.canvasHeight);

  // Create population
  for (let n = 0; n < ENV.population; n++) {
    const c = new Cell();

    c.setRandomPosition();

    c.contaminated = random() <= ENV.contaminationRate;

    population.push(c);
  }
}

function draw() {
  background(0);

  population.forEach((c) => {
    if (c.contaminated) {
      noStroke();
      fill(ENV.contaminationColor);
      ellipse(c.x, c.y, c.size, c.size);

      stroke(ENV.contaminationColor);
      noFill();
      ellipse(
        c.x,
        c.y,
        c.size + ENV.contaminationRadius,
        c.size + ENV.contaminationRadius
      );
    } else {
      noStroke();
      fill(255);
      ellipse(c.x, c.y, c.size, c.size);
    }
  });

  if (paused) return;

  population.forEach((c) => {
    c.move();
  });

  for (let i = 0; i < population.length; i++) {
    const c = population[i];

    for (let j = 0; j < population.length; j++) {
      if (j === i) continue;

      const other = population[j];

      if (
        c.getDistance(other) < ENV.contaminationRadius &&
        !other.contaminated
      ) {
        other.contaminated = random() <= ENV.contagiousness;
      }
    }
  }

  const contaminatedCount = population.reduce(
    (acc, c) => (c.contaminated ? acc + 1 : acc),
    0
  );

  const contaminatedPercent = (
    (contaminatedCount / population.length) *
    100
  ).toFixed(2);

  noStroke();
  fill(255);
  text(
    `${contaminatedCount} / ${population.length} (${contaminatedPercent}%)`,
    10,
    10 + 10
  );

  if (contaminatedCount === population.length) paused = true;
}
