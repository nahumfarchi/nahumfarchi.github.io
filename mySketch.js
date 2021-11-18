const COLORS_HEX = ["114b5f","028090","e4fde1","456990","f45b69"].map(x => '#'+x);
const palettes = [
	{ val: ["f5e3e0","2e86ab","3b1f2b","070707","d84727"].map(x => '#'+x), weight: 100, name: "Embroidery" },
	{ val: ["141115","cc2936","f2f4f3","2191fb","ff9f1c"].map(x => '#'+x), weight: 100, name: "Wiggle" },
	{ val: ["114b5f","028090","e4fde1","456990","f45b69"].map(x => '#'+x), weight: 100, name: "Static" },
	//{ val: ["f8f9fa","e9ecef","dee2e6","ced4da","adb5bd","6c757d","495057","343a40","212529"].map(x => '#'+x), weight: 1, name: "b&w" }
];
//let COLORS;
let COLORS0;
let COLORS2;
let MARGIN;
let DIM;
const DEBUG = false;
const ALPHA = 100;
let N_SHAPES = 10;
const N_ATTEMPTS = 10;
const BASE_SIZE = 1024;
const LINE_WIDTH = 4;

function setup() {
	windowWidth = windowHeight = 1024;
	MARGIN = windowWidth/10;
	DIM = min(windowWidth, windowHeight);
	//COLORS = COLORS_HEX.map(x => color(x));
	M = DIM/BASE_SIZE;
	
	createCanvas(DIM, DIM);
	//const backgroundColor = color(random(COLORS));
	const backgroundColor = color(255);
	background(backgroundColor);
	fill(0);
	noStroke();
	
	COLORS0 = random(palettes).val.map(hex => color(hex));
	COLORS1 = random(palettes).val.map(hex => color(hex));
	N_SHAPES = random([0, 1, 2, 3, 5, 10, 20]);
	const allowedTypes = [ShapeType.SmallTriangle, ShapeType.MediumTriangle, ShapeType.LargeTriangle, ShapeType.Square, ShapeType.Parallelogram];
	
	/*const c = random();
	const t0 = new Triangle(100+c, 100+c, 200+c, 200+c, 50+c, 200+c);
	const t1 = new Triangle(100+c, 100+c, 200+c, 200+c, 200+c, 100+c);
	//logPt(t0.a);
	drawTriangle(t0);
	drawTriangle(t1);
	console.log(`t0 t1 intersect = ${triTriIntersect(t0, t1)}`);*/
	
	const midPt = createVector(windowWidth/2-110, windowHeight/2);
	const scale = DIM/2.5;
	let pt = createVector(midPt.x, midPt.y);
	const d0 = ShapeProps.LargeTriangle.d[0]*scale;
	const shapes = [];
	
	if (DEBUG) console.log('shape0');
	const t = random(0, 0.2);
	//const c0 = lerpColor(random(COLORS), random(COLORS), t);
	//c0.setAlpha(ALPHA);
	//fill(c0);
	const angle0 = 0;
	const type = random(allowedTypes);
	//const shape0 = new Shape(ShapeType.SmallTriangle, pt.x, pt.y, angle0, false, scale);
	const shape0 = new Shape(type, pt.x, pt.y, angle0, random([true, false]), scale * (N_SHAPES == 0 ? 2 : 1), random([0, 1, 2]));
	//shape0.draw();
	shapes.push(shape0);
	
	if (DEBUG) console.log('boundary');
	//console.logPt(
	const boundary = [
		new Edge(shape0.vertices[0], shape0.vertices[1]),
		new Edge(shape0.vertices[1], shape0.vertices[2]),
		new Edge(shape0.vertices[2], shape0.vertices[0])
	];
	
	/*
	console.log('shape1');
	const bei = Math.floor((boundary.length-1)*random());
	const boundaryEdge = boundary[bei];
	logPt(boundaryEdge.a);
	logPt(boundaryEdge.b);
	const angle1 = p5.Vector.sub(boundaryEdge.b, boundaryEdge.a).heading();
	const shape1 = new Shape(ShapeType.SmallTriangle, boundaryEdge.a.x, boundaryEdge.a.y, angle1, true, scale);
	const c1 = lerpColor(random(COLORS), random(COLORS), t);
	c1.setAlpha(100);
	fill(c1);
	shape1.draw();
	boundary.splice(bei, 1);
	shapes.push(shape1);*/
	
	if (DEBUG) {
		console.log('----');
		logPt(shapes[0].vertices[0]);
		logPt(shapes[0].vertices[1]);
		logPt(shapes[0].vertices[2]);
		//logPt(shapes[1].vertices[0]);
		//logPt(shapes[1].vertices[1]);
		//logPt(shapes[1].vertices[2]);
		console.log('----');
	}
	
	for (let j=0; j<N_SHAPES; j++) {
		if (DEBUG) console.log(`shape j ${j}`);
		let bei2;
		let shape2;
		for (let i=0; i<N_ATTEMPTS; i++) {
			//bei2 = Math.floor((boundary.length-1)*random());
			//const be2 = boundary[bei2];
			if (DEBUG) console.log(shapes);
			const be2 = chooseRandomEdge(shapes);
			const angle2 = p5.Vector.sub(be2.b, be2.a).heading();
			
			const type = random(allowedTypes);
			shape2 = new Shape(type, be2.a.x, be2.a.y, angle2, random([true, false]), scale, random([0, 1, 2]));
			//shape2 = new Shape(random(Object.values(ShapeType)), be2.a.x, be2.a.y, angle2, true, scale, random([0, 1, 2]));
			//if (!triTrisIntersect(shape2.tris()[0], [shapes[0].tris()[0]])) {
			if (!shapeShapesIntersect(shape2, shapes) && shapeInViewport(shape2, DIM, DIM, MARGIN)) {
				//const c2 = lerpColor(random(COLORS), random(COLORS), t);
				//c2.setAlpha(ALPHA);
				//fill(c2);
				//shape2.draw();
				shapes.push(shape2);
				if (DEBUG) console.log('shape added!');
				break;
			}
			//if (!shapeShapesIntersect(shape2, shapes)) {
			//	break;
			//}
		}
	}
	
	const shapesCenter = centerOfMass(shapes);
	logPt(shapesCenter);
	if (DEBUG) { fill(255,0,0); circle(shapesCenter.x, shapesCenter.y, 10); }
	translate(-shapesCenter.x+windowWidth/2, -shapesCenter.y+windowHeight/2);
	if (DEBUG) { fill(0,255,0); circle(shapesCenter.x, shapesCenter.y, 10); }
	
	push();
	for (const s of shapes) {
		const c1 = random(COLORS0);
		const c2 = random(COLORS1);
		//const cl = random([c1, c2]); //lerpColor(lerpColor(c1, c2, 0.1), backgroundColor, t);
		fill(c1);
		stroke(0);
		strokeWeight(LINE_WIDTH*M);
		s.draw();
	}
	pop();
}

function draw() {
}

/*function mouseClicked() {
	const filename = `211008_${new Date().toISOString()}.png`;
	save(filename);
}*/

// 2 large triangles
// hypotenuse 1, sides sqrt(2)/2

// 1 medium triangle
// hypotenuse sqrt(2)/2, sides 1/2

// 2 small right triangles 
// hypotenuse 1/2, sides sqrt(2)/4

// 1 square
// sides sqrt(2)/4

// 1 parallelogram
// sides 1/2 and sqrt(2)/4

const ShapeType = {
	LargeTriangle: "LargeTriangle",
	MediumTriangle: "MediumTriangle",
	SmallTriangle: "SmallTriangle",
	Square: "Square",
	Parallelogram: "Parallelogram"
};

const ShapeProps = {
	LargeTriangle: {
		d: [1, Math.sqrt(2) / 2, Math.sqrt(2) / 2],
		a: [Math.PI - Math.PI / 4, Math.PI/2, Math.PI - Math.PI / 4]
	},
	MediumTriangle: {
		d: [Math.sqrt(2) / 2, 0.5, 0.5],
		a: [Math.PI - Math.PI / 4, Math.PI/2, Math.PI - Math.PI / 4]
	},
	SmallTriangle: {
		d: [0.5, Math.sqrt(2) / 4, Math.sqrt(2) / 4],
		a: [Math.PI - Math.PI / 4, Math.PI/2, Math.PI - Math.PI / 4]
	},
	Square: {
		d: [1, 1, 1, 1].map(x => Math.sqrt(2) / 4),
		a: [1, 1, 1, 1].map(x => Math.PI / 2)
	},
	Parallelogram: {
		d: [0.5, Math.sqrt(2) / 4, 0.5, Math.sqrt(2) / 4],
		a: [Math.PI / 4, 135 * Math.PI / 180, Math.PI / 4, 135 * Math.PI / 180]
	}
}

class Shape {
	constructor(type, x0, y0, angle0, ccw, scale, k=0) {
		// Construct shape
		const pt0 = createVector(x0, y0);
		const d = ShapeProps[type].d;
		const a = ShapeProps[type].a;
		const pts = [pt0];
		let anglei = angle0;
		for (let i = 0; i < d.length - 1; i++) {
			const j = (k+i)%d.length;
			const pti = p5.Vector.add(pts[pts.length - 1], createVector(scale * d[j] * cos(anglei), scale * d[j] * sin(anglei)));
			pts.push(pti);
			anglei += a[j]*(ccw===true ? 1 : -1);
		}
		
		this.type = type;
		this.x0 = x0;
		this.y0 = y0;
		this.vertices = pts;
	}
	
	draw() {
		const pts = this.vertices;
		beginShape()
		for (let i = 0; i < pts.length; i++) {
			if (DEBUG) logPt(pts[i]);
			vertex(pts[i].x, pts[i].y);
		}
		endShape(CLOSE);
	}
	
	tris() {
		let v0, v1, v2, v3;
		switch (this.type) {
			case ShapeType.LargeTriangle:
			case ShapeType.MediumTriangle:
			case ShapeType.SmallTriangle:
				v0 = this.vertices[0];
				v1 = this.vertices[1];
				v2 = this.vertices[2];
				return [new Triangle(v0.x, v0.y, v1.x, v1.y, v2.x, v2.y)];
			case ShapeType.Square:
			case ShapeType.Parallelogram:
				v0 = this.vertices[0];
				v1 = this.vertices[1];
				v2 = this.vertices[2];
				v3 = this.vertices[3];
				return [new Triangle(v0.x, v0.y, v1.x, v1.y, v2.x, v2.y),
								new Triangle(v2.x, v2.y, v3.x, v3.y, v0.x, v0.y)];
			default:
				throw new Error(`Unknown shape type ${this.type}`);
		}
	}
	
	intersect(otherShape) {
		return shapeShapeIntersect(this, otherShape);
	}
	
	area() {
		let area = 0;
		for (const t of this.tris()) {
			area += triArea(t);
		}
		return area;
	}
	
	center() {
		const centerPt = createVector(0, 0);
		for (const v of this.vertices) {
			centerPt.add(v);
		}
		centerPt.mult(1/this.vertices.length);
		return centerPt;
	}
}

function shapeInViewport(shape, width, height, margin) {
	for (let v of shape.vertices) {
		if (v.x < margin || v.y < margin || v.x > width-margin || v.y > height-margin) {
			return false;
		}
	}
	return true;
}

class Triangle {
	constructor(x0, y0, x1, y1, x2, y2) {
		this.a = createVector(x0, y0);
		this.b = createVector(x1, y1);
		this.c = createVector(x2, y2);
	}
}

class Edge {
	constructor(a, b, boundarySegment=null) {
		this.a = a;
		this.b = b;
		this.boundarySegment = boundarySegment;
	}
}

function drawBaseShape(type, x0, y0, angle0, ccw, scale, k=0) {
	// Construct shape
	const pt0 = createVector(x0, y0);
	const d = ShapeProps[type].d;
	const a = ShapeProps[type].a;
	const pts = [pt0];
	let anglei = angle0;
	for (let i = 0; i < d.length - 1; i++) {
		const j = (k+i)%d.length;
		const pti = p5.Vector.add(pts[pts.length - 1], createVector(scale * d[j] * cos(anglei), scale * d[j] * sin(anglei)));
		pts.push(pti);
		anglei += a[j]*(ccw===true ? 1 : -1);
	}

	// Draw shape
	beginShape()
	for (let i = 0; i < pts.length; i++) {
		logPt(pts[i]);
		vertex(pts[i].x, pts[i].y);
	}
	endShape(CLOSE);
}
	
function drawTriangle(t) {
	triangle(t.a.x, t.a.y, t.b.x, t.b.y, t.c.x, t.c.y);
}

function logPt(pt) {
	if (DEBUG) {
		console.log(`pt = (${pt.x}, ${pt.y})`);
	}
}

// check that all points of the other triangle are on the same side of the triangle after mapping to barycentric coordinates.
// returns true if all points are outside on the same side
function cross2(points, triangle) {
  var pa = points.a;
  var pb = points.b;
  var pc = points.c;
  var p0 = triangle.a;
  var p1 = triangle.b;
  var p2 = triangle.c;
  var dXa = pa.x - p2.x;
  var dYa = pa.y - p2.y;
  var dXb = pb.x - p2.x;
  var dYb = pb.y - p2.y;
  var dXc = pc.x - p2.x;
  var dYc = pc.y - p2.y;
  var dX21 = p2.x - p1.x;
  var dY12 = p1.y - p2.y;
  var D = dY12 * (p0.x - p2.x) + dX21 * (p0.y - p2.y);
  var sa = dY12 * dXa + dX21 * dYa;
  var sb = dY12 * dXb + dX21 * dYb;
  var sc = dY12 * dXc + dX21 * dYc;
  var ta = (p2.y - p0.y) * dXa + (p0.x - p2.x) * dYa;
  var tb = (p2.y - p0.y) * dXb + (p0.x - p2.x) * dYb;
  var tc = (p2.y - p0.y) * dXc + (p0.x - p2.x) * dYc;
	if (DEBUG) console.log(`sa=${sa}, sb=${sb}, sc=${sc}\nta=${ta}, tb=${tb}, tc=${tc}\n$sa+ta=${sa+ta}, sb+tb=${sb+tb}, sc+tc=${sc+tc}, D=${D}\n`);
  if (D < 0) return ((sa >= 0 && sb >= 0 && sc >= 0) ||
                     (ta >= 0 && tb >= 0 && tc >= 0) ||
                     (sa+ta <= D && sb+tb <= D && sc+tc <= D));
  return ((sa <= 0 && sb <= 0 && sc <= 0) ||
          (ta <= 0 && tb <= 0 && tc <= 0) ||
          (sa+ta >= D && sb+tb >= D && sc+tc >= D));
}

function triTriIntersect(t0, t1) {
  return !(cross2(t0,t1) ||
           cross2(t1,t0));
}
	
function shapeShapeIntersect(s0, s1) {
	const tris0 = s0.tris();
	const tris1 = s1.tris();
	for (const t0 of tris0) {
		if (triTrisIntersect(t0, tris1)) {
			return true;
		}
	}
	return false;
}

function shapeShapesIntersect(s0, shapes) {
	for (const s1 of shapes) {
		if (DEBUG) { console.log('s1'); console.log(s1); }
		if (s0.intersect(s1)) {
			return true;
		}
	}
	return false;
}

function triTrisIntersect(t0, tris) {
	for (const t of tris) {
		if (triTriIntersect(t0, t)) {
			return true;
		}
	}

	return false;
}

function chooseRandomEdge(shapes) {
	const i = Math.floor(Math.random()*shapes.length);
	if (DEBUG) console.log(`chooseRandomEdge: i=${i}`);
	const s = shapes[i];
	const vi = Math.floor(Math.random()*s.vertices.length);
	const vj = (vi+1)%s.vertices.length;
	if (DEBUG) {
		console.log(`vi=${vi}`);
		logPt(s.vertices[vi]);
		console.log(`vj=${vj}`);
		logPt(s.vertices[vj]);
	}
	return new Edge(s.vertices[vi], s.vertices[vj]);
}

function triArea(tri)
{
	const a = p5.Vector.sub(tri.a, tri.b).mag();
	const b = p5.Vector.sub(tri.b, tri.c).mag();
	const c = p5.Vector.sub(tri.c, tri.a).mag();
	
	// Length of sides must be positive
	// and sum of any two sides
	// must be smaller than third side.
	if (a < 0 || b < 0 || c < 0 ||
		 (a + b <= c) || a + c <= b ||
										 b + c <= a)
	{
			throw new Error( "Not a valid triangle");
	}
	let s = (a + b + c) / 2;
	return Math.sqrt(s * (s - a) *
									(s - b) * (s - c));
}

function centerOfMass(shapes) {
	let totalArea = 0;
	const center = createVector(0, 0);
	for (const s of shapes) {
		const area = s.area();
		const shapeCenter = s.center();
		shapeCenter.mult(area);
		center.add(shapeCenter);
		totalArea += s.area();
	}
	center.mult(1/totalArea);
	return center;
}

function drawTriangle1(pt0, pt1, pt2, n) {
	push();
	//econst n = 10;
	//n = 10;
	const tt0 = linspace(0, 1, n);
	const dt = tt0[1] - tt0[0];
	const mid = p5.Vector.add(pt0, pt1);
	const radius = p5.Vector.sub(mid, pt0).mag();
	
	mid.add(pt2);
	mid.mult(1/3);
	s = -40;
	for (const t0 of tt0) {
		if (DEBUG) console.log(t0);
		for (let t1=t0; t1<=1; t1+=dt) {
			const l0 = t0;
			const l1 = t1-t0;
			const l2 = 1-t1;
			if (DEBUG) console.log(`l0, l1, l2 = ${l0}, ${l1}, ${l2}`);
			const pt = createVector(l0*pt0.x + l1*pt1.x + l2*pt2.x, l0*pt0.y + l1*pt1.y + l2*pt2.y);
			const dist = p5.Vector.sub(pt, mid).mag()/(radius-10);
			//s += 1/n-0.0001*noise(10000*sin(2*PI*l0), pt.y);
			//s += 805/n-noise(sin(2*PI*l0),sin(2*PI*l1));
			//s += 0.0004+0.001*noise(pt.x, pt.y);
			s += 1/n;
			fill(s+random(-20,20));
			//fill(s);
			//fill(255*pow(sin(2*PI*(1-dist)+0.1*time), 4));
			//const r0 = 10*pow(sin(2*PI*(1-dist)+0.1*time), 4);// + pow(sin(2*PI*(1-dist)+0.2*time), 4);
			circle(pt.x, pt.y, 4);
		}
	}
	pop();
}

function linspace(start, end, num) {
	if (num === 0) {
		return [];
	}
	if (num === 1) {
		return [start];
	}
	let start0 = Math.min(start, end);
	let end0 = Math.max(start, end);
	
	const arr = [];
	// subtract a small amount from the step size to make sure that `end` is included in the returned array
	// (otherwise, due to numeric errors it might not be included)
	const step = (end0-start0)/(num-1)-1e-6;
	let i = start0;
	while (i <= end0) {
		if (DEBUG) console.log(`i=${i}`);
		arr.push(i);
		i += step;
	}
	if (DEBUG) console.log(`i=${i}`);

	return start < end ? arr : arr.reverse();
}