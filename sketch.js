p5.disableFriendlyErrors = true;

// Environnement settings
const ENV = {
  canvasWidth: 400,
  canvasHeight: 400,
  fullscreen: true,
  population: 2000,
  contaminationRate: 0.01,
  contagiousness: 1 / 1000,
  contaminationRadius: 20,
  contaminationColor: "#f00",
  recoveredColor: "#0f0",
  daysToRecover: 3,
  dayDuration: 4, // in seconds
};

const population = [];

class Cell {
  constructor(env) {
    this.x = 0;
    this.y = 0;
    this.xDirection = 0;
    this.yDirection = 0;
    this.speed = 1;
    this.size = 4;
    this.env = env;
    this.contaminated = Math.random() < this.env.contaminationRate;
    this.contaminationRemainingDays = this.contaminated
      ? this.env.daysToRecover
      : -1;
    this.recovered = false;
  }

  move() {
    if (this.xDirection === 0) this.xDirection = 1;
    if (this.yDirection === 0) this.yDirection = 1;

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
    this.xDirection = Math.random() > 0.5 ? 1 : -1;
    this.yDirection = Math.random() > 0.5 ? 1 : -1;
  }

  getDistance(other) {
    return dist(this.x, this.y, other.x, other.y) - this.size / 2;
  }

  spread(population) {
    if (this.contaminated) {
      for (let i = 0; i < population.length; i++) {
        const other = population[i];

        if (
          !other.contaminated &&
          this.getDistance(other) < this.env.contaminationRadius
        ) {
          other.contaminated = Math.random() <= this.env.contagiousness;
          other.contaminationRemainingDays = this.env.daysToRecover;
        }
      }
    }
  }

  recover() {
    this.contaminationRemainingDays--;
    this.recovered = this.contaminationRemainingDays === 0;

    if (this.recovered) {
      this.contaminated = false;
    }
  }

  render() {
    if (this.contaminated) {
      noStroke();
      fill(this.env.contaminationColor);
      ellipse(this.x, this.y, this.size, this.size);

      stroke(this.env.contaminationColor);
      strokeWeight(1);
      noFill();
      ellipse(
        this.x,
        this.y,
        this.size + this.env.contaminationRadius,
        this.size + this.env.contaminationRadius
      );
    } else if (this.recovered) {
      noStroke();
      fill(this.env.recoveredColor);
      ellipse(this.x, this.y, this.size, this.size);
    } else {
      noStroke();
      fill(255);
      ellipse(this.x, this.y, this.size, this.size);
    }
  }
}

let paused = true;
let days = 0;

let contaminatedCount = 0;
let maxContaminatedCount = 0;
let minContaminatedCount = Infinity;
let recoveredCount = 0;

function setup() {
  if (ENV.fullscreen) {
    createCanvas(windowWidth, windowHeight);
    document.body.classList.add("fullscreen");
  } else {
    createCanvas(ENV.canvasWidth, ENV.canvasHeight);
  }

  // Create population
  for (let n = 0; n < ENV.population; n++) {
    const c = new Cell(ENV);
    c.setRandomPosition();

    population.push(c);
  }

  background(0);
  drawPopulation();

  if (paused) noLoop();
}

function draw() {
  background(0);

  const isDay = frameCount % (60 * ENV.dayDuration) === 0;
  if (isDay) days++;

  for (let i = 0; i < population.length; i++) {
    const p = population[i];

    p.spread(population);
    p.move();

    if (p.contaminated && isDay) {
      p.recover();
    }
  }

  drawPopulation();
  drawStats();

  if (contaminatedCount === 0) noLoop();
}

function mousePressed() {
  paused = !paused;

  if (paused) {
    noLoop();
  } else {
    loop();
  }
}

function drawPopulation() {
  for (let i = 0; i < population.length; i++) {
    const p = population[i];

    p.render();
  }
}

function drawStats() {
  const stateLabel = paused ? "[PAUSED]" : "";
  const fps = Math.round(frameRate());
  contaminatedCount = population.filter((p) => p.contaminated).length;
  recoveredCount = population.filter((p) => p.recovered).length;
  maxContaminatedCount = Math.max(contaminatedCount, maxContaminatedCount);
  minContaminatedCount = Math.min(contaminatedCount, minContaminatedCount);
  const contaminatedPercent = (
    (contaminatedCount / population.length) *
    100
  ).toFixed(2);
  const maxContaminatedPercent = (
    (maxContaminatedCount / population.length) *
    100
  ).toFixed(2);
  const minContaminatedPercent = (
    (minContaminatedCount / population.length) *
    100
  ).toFixed(2);

  const textSize = 10;
  const textX = 10;
  const textY = textSize + 10;

  stroke(0);
  strokeWeight(4);
  fill(255, 255, 0);
  text(textSize);
  text(
    `Day ${days} \
    Current: ${contaminatedCount} / ${population.length} (${contaminatedPercent}%) \
    Min: ${minContaminatedCount} (${minContaminatedPercent}%) \
    Max: ${maxContaminatedCount} (${maxContaminatedPercent}%) \
    Recovered: ${recoveredCount} \
    ${fps} FPS \
    ${stateLabel}`,
    textX,
    textY
  );

  const rectWidth = 100;
  const rectHeight = 6;

  noStroke();
  fill(255);
  rect(textX, textY + textSize, rectWidth, rectHeight);

  noStroke();
  fill(ENV.contaminationColor);
  rect(
    textX,
    textY + textSize,
    map(contaminatedPercent, 0, 100, 0, rectWidth),
    rectHeight
  );
}
