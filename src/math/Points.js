import { range } from "./Range.js";

export class Point2 {
	x = 0;
	y = 0;

	constructor(x=this.x, y=this.y) {
		this.x = x;
		this.y = y;
	}

	set(x=this.x, y=this.y) {
		this.x = x;
		this.y = y;
		return this;
	}
	/**
	 * 
	 * @param {number | Point2} x
	 * @param {number | undefined} y 
	 */
	translate(x, y) {
		if (typeof x == "object" && typeof x?.x == "number" && typeof x?.y == "number") {
			y = x.y;
			x = x.x;
		}
		this.x += x;
		this.y += y;
		return this;
	}
	scale(x=1, y=1) {
		this.x *= x;
		this.y *= y;
		return this;
	}

	/** @param {number|1} increment */
	round(increment) {
		if (!increment) increment = 1;
		this.x = Math.round(this.x / increment) * increment;
		this.y = Math.round(this.y / increment) * increment;
		return this;
	}

	/** @param {number|1} increment */
	floor(increment) {
		if (!increment) increment = 1;
		this.x = Math.floor(this.x / increment) * increment;
		this.y = Math.floor(this.y / increment) * increment;
		return this;
	}

	/** @param {number|1} increment */
	ceil(increment) {
		if (!increment) increment = 1;
		this.x = Math.ceil(this.x / increment) * increment;
		this.y = Math.ceil(this.y / increment) * increment;
		return this;
	}

	/**
	 * 
	 * @param {number | Point2} x 
	 * @param {number | undefined} y 
	 * @returns 
	 */
	equals(x=0,y=0) {
		if (x instanceof Point2) { y = x.x; x = x.x; }
		return this.x == x && this.y == y;
	}

	toObject() {
		return {
			x: this.x,
			y: this.y
		}
	}
	clone() {
		return new Point2(this.x, this.y);
	}

	/** @param {Point2} point */
	distanceTo(point) { return Point2.distanceBetween(this, point); }
	/** @param {Point2} point */
	angleTo(point) { return Point2.angleBetween(this, point); }

	/**
	 * @param {Point2|{x:number,y:number}} p1
	 * @param {Point2|{x:number,y:number}} p2
	 * @returns {number}
	 */
	static distanceBetween(p1, p2) {
		return Math.hypot(p2.x-p1.x, p2.y-p1.y);
	}

	/**
	 * @param {Point2|{x:number,y:number}} start
	 * @param {Point2|{x:number,y:number}} end
	 * @returns {number}
	 */
	static angleBetween(start, end) {
		return Math.atan2(end.x-start.x, end.y-start.y);
	}

	/** Reference to: `Point2.distanceBetween(p1, p2)`*/
	static distance = Point2.distanceBetween;
	/** Reference to: `Point2.angleBetween(start, end)`*/
	static angle = Point2.angleBetween;
}

export class Point3 extends Point2 {
	x = 0;
	y = 0;
	z = 0;

	constructor(x=0, y=0, z=0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	set(x=0, y=0, z=0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	translate(x=0, y=0, z=0) {
		this.x += x;
		this.y += y;
		this.z += z;
	}
	scale(x=1, y=1, z=1) {
		this.x *= x;
		this.y *= y;
		this.z *= z;
	}

	/**
	 * 
	 * @param {number | Point2} x
	 * @param {number | undefined} y
	 * @param {number | undefined} z
	 * @returns 
	 */
	equals(x=0, y=0, z=0) {
		if (x instanceof Point3) { y = x.x; z = x.z; x = x.x; }
		return this.x == x && this.y == y && this.z == z;
	}

	toObject() {
		return {
			x: this.x,
			y: this.y,
			z: this.z
		}
	}
}

export class Point4 {
	x = 0;
	y = 0;
	w = 0;
	h = 0;

	constructor(x=0, y=0, w=0, h=0) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	/**
	 * 
	 * @param { number | Point4 } x
	 * @param { number | undefined } y
	 * @param { number | undefined } w
	 * @param { number | undefined } h
	 */
	set(x, y, w, h) {
		if (x instanceof Point4 || (x?.w && x?.h)) {
			y = x.y;
			w = x.w;
			h = x.h;
			x = x.x;
		}
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	translate(x=0, y=0, w=0, h=0){
		this.x += x;
		this.y += y;
		this.w += w;
		this.h += h;
	}
	scale(x=1, y=1, w=1, h=1) {
		this.x *= x;
		this.y *= y;
		this.w *= w;
		this.h *= h;
	}

	/**
	 * 
	 * @param {number | Point2 | {x:number, y:number}} x
	 * @param {number | undefined} y
	 * @param {number | undefined} z
	 * @returns {boolean}
	 */
	contains(x=0, y=0) {
		if (typeof x == "object" && x.x && x.y) { y = x.y; x = x.x; }
		return range.fits(this.x, x, this.x+this.w) && range.fits(this.y, y, this.y+this.h);
	}

	/**
	 * @param {Point4} point4
	 * @returns {boolean}
	 */
	intersectingWith(point4) {
		let r1_left = this.x - this.w / 2;
		let r1_right = this.x + this.w / 2;
		let r1_up = this.y - this.h / 2;
		let r1_down = this.y + this.h / 2;
		
		let r2_left = point4.x - point4.w / 2;
		let r2_right = point4.x + point4.w / 2;
		let r2_up = point4.y - point4.h / 2;
		let r2_down = point4.y + point4.h / 2;

		let r1IntersectingX = range.fits(r2_left, r1_left, r2_right) || range.fits(r2_left, r1_left, r2_right);
		let r1IntersectingY = range.fits(r2_up, r1_up, r2_down) || range.fits(r2_up, r1_down, r2_down);

		let r2IntersectingX = range.fits(r1_left, r2_left, r1_right) || range.fits(r1_left, r2_left, r1_right);
		let r2IntersectingY = range.fits(r1_up, r2_up, r1_down) || range.fits(r2_up, r1_down, r2_down);

		let intersecting = (
			(r1IntersectingX && r1IntersectingY) ||
			(r2IntersectingX && r2IntersectingY) ||
			(r1IntersectingX && r2IntersectingY) ||
			(r1IntersectingY && r2IntersectingX)
		);
		
		return intersecting;
	}

	clone() {
		return new Point4(this.x, this.y, this.w, this.h);
	}

	toObject() {
		return {
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h
		}
	}
}