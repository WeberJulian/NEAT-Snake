let { NEAT, activation, crossover, mutate } = require('./NEAT-JS/lib/NEAT');

class Food {
  constructor(gridSize) {
    this.x = -1;
    this.y = -1;
    this.gridSize = gridSize;
    this.positions = [];
  }
  reset(body) {
    let valid = false;
    while (!valid) {
      let intersection = false;
      this.x = randInt(0, this.gridSize);
      this.y = randInt(0, this.gridSize);
      for (let i = 0; i < body.length; i++) {
        if (body[i].x == this.x && body[i].y == this.y) {
          intersection = true;
        }
      }
      if (!intersection) {
        valid = true;
      }
    }
    this.value = 1;
    this.positions.push({ x: this.x, y: this.y });
  }
}

class Snake {
  constructor(gridSize) {
    this.body = [
      { x: Math.ceil(gridSize / 2), y: Math.ceil(gridSize / 2) },
      { x: Math.ceil(gridSize / 2) - 1, y: Math.ceil(gridSize / 2) },
      { x: Math.ceil(gridSize / 2) - 2, y: Math.ceil(gridSize / 2) }
    ];
    this.direction = 1;
    this.alive = true;
    this.score = 0;
    this.gridSize = gridSize;
    this.food = new Food(gridSize);
    this.food.reset(this.body);
  }

  move() {
    this.body.unshift({
      x: this.body[0].x + num2dir(this.direction).x,
      y: this.body[0].y + num2dir(this.direction).y
    });
    if (outOfBounds(this.body[0], this.gridSize)) {
      this.alive = false;
    }
    if (this.isInBody(this.body[0])) {
      this.alive = false;
    }
    if (this.body[0].x == this.food.x && this.body[0].y == this.food.y) {
      this.food.reset(this.body);
      this.score += 1;
    } else {
      this.body.pop();
    }
  }

  look() {
    let head = this.body[0];
    let vision = [];
    head.y--;
    vision.push(this.isInBody(head) || outOfBounds(head, this.gridSize));
    head.x++;
    head.y++;
    vision.push(this.isInBody(head) || outOfBounds(head, this.gridSize));
    head.x--;
    head.y++;
    vision.push(this.isInBody(head) || outOfBounds(head, this.gridSize));
    head.x--;
    head.y--;
    vision.push(this.isInBody(head) || outOfBounds(head, this.gridSize));
    head.x++;
    vision = rotateArray(vision, this.direction);
    vision.splice(2,1)
    let angle = Math.atan2(this.food.y - head.y, this.food.x - head.x); 
    angle = ((angle - (Math.PI/2)*this.direction) + 2*Math.PI)%(2*Math.PI)
    vision.push(Math.cos(angle));
    vision.push(Math.sin(angle));
    return vision;
  }

  isInBody(point) {
    for (let i = 1; i < this.body.length; i++) {
      if (this.body[i].x == point.x && this.body[i].y == point.y) {
        return 1;
      }
    }
    return 0;
  }
}

class Game {
  constructor() {
    this.gridSize = 30;
    this.snake = new Snake(this.gridSize);
    this.state = [];
    this.tick = 0;
    this.record = {
      foodPositions: null,
      decisions: []
    };
  }

  step(direction) {
    this.record.decisions.push(direction);
    this.snake.direction = direction;
    this.snake.move();
    if (this.snake.alive) {
      this.tick++;
    }
    return this.snake.alive;
  }

  getObservation() {
    return this.snake.look();
  }

  getAlive(){
    return this.snake.alive
  }

  getScore() {
    return this.snake.score;
  }

  getFitness() {
    return this.snake.score * 1000 + this.tick;
  }

  getRecord() {
    this.record.foodPositions = this.snake.food.positions;
    return this.record;
  }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function num2dir(num) {
  switch (num) {
    case 0:
      return { x: 0, y: -1 };
    case 1:
      return { x: 1, y: 0 };
    case 2:
      return { x: 0, y: 1 };
    case 3:
      return { x: -1, y: 0 };
  }
}

function outOfBounds(point, gridSize) {
  if (
    point.x >= gridSize ||
    point.y >= gridSize ||
    point.x < 0 ||
    point.y < 0
  ) {
    return 1;
  } else {
    return 0;
  }
}

function rotateArray(arr, n) {
  for (let i = 0; i < n; i++) {
    arr.push(arr.shift());
  }
  return arr;
}

function avg(arr){
  return arr.reduce((a,b)=>a+b)/arr.length
}

// let game = new Game();
// while(game.getAlive()){
//   console.log(game.getObservation());
//   console.log(game.getScore())
//   let decision = ((randInt(0,3) - 1) + game.snake.direction + 4)%4
//   game.step(decision)
// }

let config = {
  model: [
    { nodeCount: 5, type: "input" },
    { nodeCount: 3, type: "output", activationfunc: activation.LEAKY_RELU }
  ],
  mutationRate: 0.05,
  crossoverMethod: crossover.RANDOM,
  mutationMethod: mutate.RANDOM,
  populationSize: 25
};

let neat = new NEAT(config);

const NB_GENERATION = 50;
const MAX_STEP = 400;

let maxs = []
let avgs = []

for (let j = 0; j < NB_GENERATION; j++) {
  console.log(`Generation ${j}`)
  let games = [];
  for (let i = 0; i < config.populationSize; i++) {
    games.push(new Game());
  }
  let someAlive = true;
  let fitness = []
  let step = 0;
  while(someAlive && step < MAX_STEP){
    fitness = [Math.max(...fitness)]
    for (let i = 0; i < config.populationSize; i++) {
      neat.setInputs(games[i].getObservation(), i)
    }
    neat.feedForward();
    let decisions = neat.getDesicions();
    someAlive = false;
    for (let i = 0; i < config.populationSize; i++) {
      if(games[i].getAlive()){
        someAlive = true;
        games[i].step(((decisions[i] - 1) + games[i].snake.direction + 4)%4)
      }
      else{
        neat.setFitness(games[i].getFitness(), i);
        fitness.push(games[i].getFitness())
      }
    }
    step++;
  }
  maxs.push(Math.max(...fitness))
  avgs.push(avg(fitness))
  console.log(`Max fitness ${Math.max(...fitness)}`)
  console.log(`Avg fitness ${avg(fitness)}`)
  neat.doGen();
}

console.log(`\n`)
console.log(maxs)
console.log(avgs)