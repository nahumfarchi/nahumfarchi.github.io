import p5 from 'p5';
const canvasSketch = require('canvas-sketch');

const settings: any = {
  p5: { p5 },
  animate: false,
  dimensions: [ 1024, 1024 ]
};

interface Props {
  p5: p5;
  width: number;
  height: number;
  playhead: number;
}

class Circle {
  public readonly pos: Point2d;
  public readonly r: number;
  public neighbors: Circle[];

  constructor(x: number, y: number, r: number) {
    this.pos = new Point2d(x, y);
    this.r = r;
    this.neighbors = [];
  }

  public get x(): number {
    return this.pos.x;
  }

  public get y(): number {
    return this.pos.y;
  }

  appendNeighbor(n: Circle) {
    this.neighbors.push(n);
  }
}

class CircleGrid {
  public readonly entries: Circle[][];

  constructor(rows: number, cols: number, xWidth: number, yWidth: number, margin: number, radius: number) {
    this.entries = [];
    const stepx = (xWidth-2*(margin+radius)) / (cols-1);
    const stepy = (yWidth-2*(margin+radius)) / (rows-1);
    for (let r = 0; r < rows; r++) {
      this.entries[r] = [];
      for (let c = 0; c < cols; c++) {
        const x = margin+radius+stepx*c;
        const y = margin+radius+stepy*r;
        this.entries[r][c] = new Circle(x, y, radius);
      }
    }

    const grid = this.entries;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const circ = grid[r][c];
        if (r>0 && c>0)           circ.appendNeighbor(grid[r-1][c-1]);
        if (r>0)                  circ.appendNeighbor(grid[r-1][c]);
        if (r>0 && c<cols-1)      circ.appendNeighbor(grid[r-1][c+1]);
        if (c>0)                  circ.appendNeighbor(grid[r][c-1]);
        if (c<cols-1)             circ.appendNeighbor(grid[r][c+1]);
        if (r<rows-1 && c>0)      circ.appendNeighbor(grid[r+1][c-1]);
        if (r<rows-1)             circ.appendNeighbor(grid[r+1][c]);
        if (r<rows-1 && c<cols-1) circ.appendNeighbor(grid[r+1][c+1]);
      }
    }
  }
}

class Point2d {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Vec2d {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  mult(a: number) {
    return new Vec2d(a*this.x, a*this.y);
  }

  norm() {
    return Math.sqrt(this.x*this.x+this.y*this.y);
  }

  normalize() {
    return this.mult(1.0/this.norm());
  }

  rot(angle: number) {
    const x = this.x*Math.cos(angle) - this.y*Math.sin(angle);
    const y = this.x*Math.sin(angle) + this.y*Math.cos(angle);
    return new Vec2d(x, y);
  }
}

function p0p1n(p0: Point2d, p1: Point2d): Vec2d {
  return new Vec2d(p1.x-p0.x, p1.y-p0.y).normalize();
}

function cross(v1: Vec2d, v2: Vec2d): number {
  return v1.x*v2.y - v1.y*v2.x;
}

function setDifference(A: any[], B: any[]) {
  return A.filter(x => B.indexOf(x) < 0);
}

type Line = [Point2d, Point2d];

// Assumes both circles have the same radius
function connectCircles(c1: Circle, c2: Circle, ccw: boolean): Line {
  console.assert(c1.r === c2.r, 'connectCircles: circle rads must be equal!');
  const v = p0p1n(c1.pos, c2.pos).mult(c1.r).rot(ccw ? Math.PI/2 : -Math.PI/2);
  const p1 = new Point2d(c1.x+v.x, c1.y+v.y);
  const p2 = new Point2d(c2.x+v.x, c2.y+v.y);
  return [p1, p2];
}

function choose(obj: any) {
  const keys = Object.keys(obj);
  const idx = Math.floor(Math.random()*keys.length);
  return obj[keys[idx]];
}

function findCandidate(currentCircle: Circle, ring: Circle[]): Circle | null {
  const candidates = setDifference(currentCircle.neighbors, setDifference(ring, [ring[0]]));
  let nextCircle;
  let v0: Vec2d;
  let v1: Vec2d;
  do {
    nextCircle = choose(candidates);
    const idx = candidates.indexOf(nextCircle);
    if (idx > -1) {
      candidates.splice(idx, 1);
    }
    else {
      console.log('Could not close the ring :(');
      return null;
    }
    v0 = p0p1n(new Point2d(0, 0), currentCircle.pos);
    v1 = p0p1n(new Point2d(0, 0), nextCircle.pos);
  } while (cross(v0, v1) > 0 && candidates.length > 0)

  return nextCircle;
}

function wrapString(startingCircle: Circle): Circle[] {
  let currentCircle = startingCircle;
  let nextCircle;
  let ring = [currentCircle];
  do {
    nextCircle = findCandidate(currentCircle, ring);
    if (!nextCircle) {
      break;
    }

    ring.push(nextCircle);
    currentCircle = nextCircle;
  } while (nextCircle !== ring[0]);

  return ring;
}

const sketch = () => {
  return ({ p5, width, height, playhead }: Props) => {
    // Clear the background
    p5.background(255);
    p5.fill(255);
    p5.noStroke();

    // Create circles grid
    const GRID_SIZE = 5;
    const MARGIN = 100;
    const RADIUS = 50;
    const grid = new CircleGrid(GRID_SIZE, GRID_SIZE, width, height, MARGIN, RADIUS);

    // Draw circles
    p5.noFill();
    p5.stroke(0);
    p5.strokeWeight(5);
    const circles = grid.entries;
    for (const row of circles) {
      for (const circ of row) {
        p5.circle(circ.x, circ.y, 2*circ.r);
      }
    }

    let startingCircle = choose(choose(circles));
    p5.push();
    p5.fill(0);
    p5.circle(startingCircle.x, startingCircle.y, 2*startingCircle.r);
    p5.pop();

    const ring = wrapString(startingCircle);

    // Draw ring
    for (let i = 0; i < ring.length-1; i++) {
      const line = connectCircles(ring[i], ring[i+1], false);
      p5.line(line[0].x, line[0].y, line[1].x, line[1].y);
    }

    console.log("Done :)");
  };
};

canvasSketch(sketch, settings);