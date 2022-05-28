p5.disableFriendlyErrors = true;

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
  fullscreen: true,
  population: 1000,
  contaminationRate: 0.1,
  contagiousness: 0.001,
  contaminationRadius: 4,
  contaminationColor: COLORS.RED,
  dayDuration: 4, // in seconds
};

const population = [];

class Cell {
  constructor(
    settings = {
      x: 0,
      y: 0,
      xDirection: 0,
      yDirection: 0,
      speed: 2,
      size: 2,
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
    this.xDirection =
      Math.random() > 0.5 ? DIRECTIONS.FORWARD : DIRECTIONS.BACKWARD;
    this.yDirection =
      Math.random() > 0.5 ? DIRECTIONS.FORWARD : DIRECTIONS.BACKWARD;
  }

  getDistance(other) {
    const x = this.x - other.x;
    const y = this.y - other.y;

    return Math.sqrt(x ** 2 + y ** 2) - this.size / 2;
  }
}

let startButton;
let paused = true;
let days = 0;

function setup() {
  if (ENV.fullscreen) {
    createCanvas(windowWidth, windowHeight);
  } else {
    createCanvas(ENV.canvasWidth, ENV.canvasHeight);
  }

  startButton = createButton("Start/Pause");
  startButton.position(0, 0);
  startButton.mousePressed(() => {
    paused = !paused;
  });

  // Create population
  for (let n = 0; n < ENV.population; n++) {
    const c = new Cell();

    c.setRandomPosition();

    c.contaminated = Math.random() <= ENV.contaminationRate;

    population.push(c);
  }
}

function draw() {
  background(0);

  let contaminatedCount = 0;

  population.forEach((c) => {
    if (c.contaminated) {
      contaminatedCount++;

      noStroke();
      fill(ENV.contaminationColor);
      ellipse(c.x, c.y, c.size, c.size);

      stroke(ENV.contaminationColor);
      strokeWeight(1);
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

    if (!paused) c.move();
  });

  const contaminatedPercent = (
    (contaminatedCount / ENV.population) *
    100
  ).toFixed(2);

  const textX = startButton ? startButton.width + 10 : 10;
  const textY = 10 + 6;

  stroke(0);
  strokeWeight(4);
  fill(255, 255, 0);
  text(
    `Day ${days} - ${contaminatedCount} / ${population.length} (${contaminatedPercent}%)`,
    textX,
    textY
  );

  if (frameCount % (ENV.dayDuration * 60) === 0) {
    days++;
  }

  if (contaminatedCount === population.length) paused = true;

  if (paused) return;

  for (let i = 0; i < population.length; i++) {
    const c = population[i];

    if (c.contaminated) {
      for (let j = 0; j < population.length; j++) {
        if (j === i) continue;

        const other = population[j];

        if (
          !other.contaminated &&
          c.getDistance(other) < ENV.contaminationRadius
        ) {
          other.contaminated = Math.random() <= ENV.contagiousness;
        }
      }
    }
  }
}
