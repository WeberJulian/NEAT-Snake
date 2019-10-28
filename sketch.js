const s = p => {
  const cellSize = 40;
  const gridSize = 10;
  const timeStep = 100;
  const margin = 5;
  let score = 0;
  let canChangeDirection = true;
  let tick = 0;

  class Food {
    constructor() {
      this.x = -1;
      this.y = -1;
    }
    reset(body) {
      let valid = false;
      while (!valid) {
        let intersection = false;
        this.x = randInt(0, gridSize);
        this.y = randInt(0, gridSize);
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
      this.gridSize = gridSize;
      this.food = new Food();
      this.food.reset(this.body);
    }

    move() {
      this.body.unshift({
        x: this.body[0].x + num2dir(this.direction).x,
        y: this.body[0].y + num2dir(this.direction).y
      });
      if (
        this.body[0].x >= this.gridSize ||
        this.body[0].y >= this.gridSize ||
        this.body[0].x < 0 ||
        this.body[0].y < 0
      ) {
        this.alive = false;
      }
      for (let i = 1; i < this.body.length; i++) {
        if (
          this.body[i].x == this.body[0].x &&
          this.body[i].y == this.body[0].y
        ) {
          this.alive = false;
        }
      }
      if (this.body[0].x == this.food.x && this.body[0].y == this.food.y) {
        this.food.reset(this.body);
        score += 1;
      } else {
        this.body.pop();
      }
    }
  }

  let snake = new Snake(gridSize);

  p.setup = () => {
    p.createCanvas(gridSize * cellSize, gridSize * cellSize);
    tick = p.millis();
  };

  p.draw = () => {
    p.noStroke();
    if (!snake.alive) {
      drawGameOver();
    } else if (tick + timeStep <= p.millis()) {
      canChangeDirection = true;
      p.background(75);
      tick = p.millis();
      snake.move();
      drawSnake();
      drawFood();
      drawScore();
    }
  };

  function drawGameOver() {
    p.background(0);
    p.fill(200);
    p.textSize(35);
    p.textAlign(p.CENTER);
    p.text(
      "GAME OVER",
      Math.ceil((gridSize * cellSize) / 2),
      Math.ceil((gridSize * cellSize) / 2)
    );
  }

  function drawScore() {
    p.fill(255);
    p.textSize(15);
    p.textAlign(p.LEFT);
    p.text("Score : " + score, margin, margin * 3);
  }

  function drawFood() {
    p.fill(p.color(255, 0, 0));
    p.rect(
      snake.food.x * cellSize,
      snake.food.y * cellSize,
      cellSize,
      cellSize
    );
  }

  function drawSnake() {
    p.fill(255);
    for (let i = 0; i < snake.body.length; i++) {
      p.rect(
        snake.body[i].x * cellSize,
        snake.body[i].y * cellSize,
        cellSize,
        cellSize
      );
    }
  }

  p.keyPressed = () => {
    if (canChangeDirection) {
      if (p.keyCode === p.UP_ARROW && snake.direction != 2) {
        snake.direction = 0;
        canChangeDirection = false;
      } else if (p.keyCode === p.RIGHT_ARROW && snake.direction != 3) {
        snake.direction = 1;
        canChangeDirection = false;
      } else if (p.keyCode === p.DOWN_ARROW && snake.direction != 0) {
        snake.direction = 2;
        canChangeDirection = false;
      } else if (p.keyCode === p.LEFT_ARROW && snake.direction != 1) {
        snake.direction = 3;
        canChangeDirection = false;
      }
    }
    if (p.key === "r") {
      snake = new Snake(gridSize);
      score = 0;
      step += 1;
    }
  };

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
};

let myp5 = new p5(s);
