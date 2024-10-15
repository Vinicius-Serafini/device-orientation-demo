class Canvas {
  /** @type {HTMLCanvasElement} */
  canvas;
  /** @type {CanvasRenderingContext2D} */
  ctx;
  height = 0;
  width = 0;
  rows = 32;
  columns = 18;
  cellWidth = 0;
  cellHeight = 0;

  /** @type {(-1 | 1 | 0)} */
  xOrientation = 1;
  /** @type {(-1 | 1 | 0)} */
  yOrientation = -1;

  /** @type {boolean[][]} */
  grid = [];

  /**
   * 
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.height = this.canvas.clientHeight;
    this.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.cellWidth = this.width / this.columns;
    this.cellHeight = this.height / this.rows;
    this.grid = this.buildGrid();
  }

  buildGrid() {
    return Array.from({ length: this.rows }, () => new Array(this.columns).fill(false));
  }

  populateGrid() {
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        this.grid[row][column] = Math.random() > 0.8;
      }
    }
  }

  nextGen() {
    const nextGrid = this.buildGrid();

    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const isAlive = this.grid[row][column];

        if (!isAlive) {
          continue;
        }

        const newYPosition = row + this.yOrientation;
        const isNewYOutOfBounds = newYPosition < 0 || newYPosition > this.rows - 1;
        let nextYPosition = !isNewYOutOfBounds ? newYPosition : row;

        if (this.grid[nextYPosition][column] || nextGrid[nextYPosition][column]) {
          nextYPosition = row;
        }

        const newXPosition = column + this.xOrientation;
        const isNewXOutOfBounds = newXPosition < 0 || newXPosition > this.columns - 1;
        let nextXPosition = !isNewXOutOfBounds ? newXPosition : column;

        if (this.grid[nextYPosition][nextXPosition] || nextGrid[nextYPosition][nextXPosition]) {
          nextXPosition = column;
        }

        nextGrid[nextYPosition][nextXPosition] = true;
      }
    }

    this.grid = nextGrid;
  }

  drawGrid() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        if (this.grid[row][column]) {
          this.ctx.fillStyle = 'black';
          this.ctx.fillRect(column * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight);
        }
      }
    }
  }

  countElements() {
    const count = this.grid.reduce((acc, row) => {
      return acc + row.reduce((acc, cell) => {
        return acc + (cell ? 1 : 0);
      }, 0);
    }, 0);

    return count;
  }

  render() {
    const FPS = 1000 / 14;

    this.nextGen();
    this.drawGrid();

    setTimeout(() => {
      requestAnimationFrame(() => {
        this.render();
      });
    }, FPS);

  }

  resize() {
    this.height = this.canvas.clientHeight;
    this.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
  }
}


const canvasEl = document.getElementById('canvas');
const canvas = new Canvas(canvasEl);

canvas.populateGrid();
canvas.render();

window.addEventListener('deviceorientation', (event) => {
  if (event.gamma === null && event.beta == null) {
    canvas.yOrientation = 1;
    canvas.xOrientation = 0;

    alert('No device orientation data available');
  }

  const leftToRight = event.gamma; // gamma: left to right
  const frontToBack = event.beta;

  const THRESHOLD = 5;

  if (frontToBack > THRESHOLD) {
    canvas.yOrientation = 1;
  } else if (frontToBack < -THRESHOLD) {
    canvas.yOrientation = -1;
  } else {
    canvas.yOrientation = 0;
  }

  if (leftToRight > THRESHOLD) {
    canvas.xOrientation = 1;
  } else if (leftToRight < -THRESHOLD) {
    canvas.xOrientation = -1;
  } else {
    canvas.xOrientation = 0;
  }
});