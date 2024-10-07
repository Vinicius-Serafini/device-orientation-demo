class Canvas {
  /** @type {HTMLCanvasElement} */
  canvas;
  /** @type {CanvasRenderingContext2D} */
  ctx;
  height = 0;
  width = 0;
  rows = 16;
  columns = 9;
  cellWidth = 0;
  cellHeight = 0;

  /** @type {(-1 | 1 | 0)} */
  xOrientation = 1;
  /** @type {(-1 | 1 | 0)} */
  yOrientation = 1;

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
    this.grid[parseInt(this.rows / 2)][parseInt(this.columns / 2)] = true;
  }

  nextGen() {
    const nextGrid = this.buildGrid();

    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const isAlive = this.grid[row][column];

        if (!isAlive) {
          continue;
        }

        const nextYNeighbor = this.yOrientation === 1 ? -1 : 1;
        const isTheLastRow = this.yOrientation === -1 ? row === 0 : row === this.rows - 1;
        const nextXNeighbor = this.xOrientation === 1 ? 1 : -1;
        const isTheLastColumn = this.xOrientation === -1 ? column === 0 : column === this.columns - 1;

        const isXOutOfBounds = column + nextXNeighbor < 0 || column + nextXNeighbor >= this.columns;
        const isYOutOfBounds = row + nextYNeighbor < 0 || row + nextYNeighbor >= this.rows;
        const hasYNeighbor = !isYOutOfBounds && this.grid[row + nextYNeighbor][column];
        const hasXNeighbor = !isXOutOfBounds && this.grid[row][column + nextXNeighbor];

        if (isTheLastColumn) {
          if (!isYOutOfBounds && !hasYNeighbor) {
            nextGrid[row + nextYNeighbor][column] = true;
            continue;
          }

          nextGrid[row][column] = true;

          continue;
        }

        if (!hasXNeighbor && !hasYNeighbor) {
          nextGrid[row + nextYNeighbor][column + nextXNeighbor] = true;

          continue;
        }

        if (!hasYNeighbor) {
          nextGrid[row + nextYNeighbor][column] = true;

          continue;
        }

        if (!hasXNeighbor) {
          nextGrid[row][column + nextXNeighbor] = true;

          continue;
        }
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
  const { alpha, beta, gamma } = event;

  let angle = -(alpha + beta * gamma / 90);
  angle -= Math.floor(angle / 360) * 360; // Wrap to range [0,360]

  canvas.yOrientation = angle >= 270 || angle <= 90 ? -1 : 1;
  canvas.xOrientation = angle <= 360 && angle >= 180 ? 1 : -1;
});