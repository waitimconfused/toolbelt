const radToDeg = 180 / Math.PI;
const degToRad = Math.PI / 180;

export class Vector {
	#deg = 0;
	#rad = 0;
	#mag = 1;
	#x = 1;
	#y = 0;

	/** @param {number} number */
	set deg(number) {
		this.#deg = number;
		this.#rad = number * degToRad;
		this.#x = this.#mag * Math.cos( this.#rad );
		this.#y = this.#mag * Math.sin( this.#rad );
		this.#defaultMode = "deg";
	}
	get deg() { return this.#deg; }


	/** @param {number} number */
	set rad(number) {
		this.#deg = number * radToDeg;
		this.#rad = number;
		this.#x = this.#mag * Math.cos(number);
		this.#y = this.#mag * Math.sin(number);
		this.#defaultMode = "rad";
	}
	get rad() { return this.#rad; }


	/** @param {number} number */
	set mag(number) {
		this.#mag = number;
		this.#x = this.#mag * Math.cos( this.#rad );
		this.#y = this.#mag * Math.sin( this.#rad );
	}
	get mag() { return this.#mag; }


	/** @param {number} number */
	set x(number) {
		this.#x = number;
		this.#mag = Math.hypot(number, this.#y);
		this.#rad = Math.atan2(this.#y, number);
		this.#deg = this.#rad * radToDeg;
		this.#defaultMode = "xy";
	}
	get x() { return this.#x; }

	/** @param {number} number */
	set y(number) {
		this.#y = number;
		this.#mag = Math.hypot(this.#x, number);
		this.#rad = Math.atan2(number, this.#x);
		this.#deg = this.#rad * radToDeg;
		this.#defaultMode = "xy";
	}
	get y() { return this.#y; }

	/** @type {"xy"|"deg"|"rad"} */
	#defaultMode = "xy";

	/**
	 * When `mode="xy"`, `a` represents the *X-position*, and `b` represents the *Y-position*
	 * 
	 * When `mode="deg"`, `a` represents the *magnitude*, and `b` represents the *angle* (***in degrees***)
	 * 
	 * When `mode="rad"`, `a` represents the *magnitude*, and `b` represents the *angle* (***in radians***)
	 * 
	 * @param {"xy"|"deg"|"rad"} mode
	 * Determines if `a` and `b` should be interpreted as `x` & `y`, or magnitude & angle
	 * @param {number} a
	 * If `mode="xy"`, this represents `Vector.x`.
	 * 
	 * If `mode="deg"|"rad"`, this represents `Vector.magnitude`
	 * @param {number} b
	 * If `mode="xy"`, this represents `Vector.y`.
	 * 
	 * If `mode="deg"`, this represents `Vector.deg`.
	 * 
	 * If `mode="rad"`, this represents `Vector.rad`
	 */
	constructor(mode, a, b) {
		if (mode == "xy") {
			this.#x = a;
			this.y = b;
		} else if (mode == "deg") {
			this.#mag = a;
			this.deg = b;
		} else if (mode == "rad") {
			this.#mag = a;
			this.rad = b;
		} else {
			throw new Error("Unknown Vector constructor mode of: \""+mode+"\"");
		}
		this.#defaultMode = mode;
	}


	/** @param {...Vector} vectors */
	add(...vectors) {
		let newVector = Vector.sumOf(this, ...vectors);
		this.#x = newVector.x;
		this.#y = newVector.y;
		this.#deg = newVector.deg;
		this.#rad = newVector.rad;
		this.#mag = newVector.mag;
		return this;
	}


	/**
	 * @param {number} x
	 * @param {number} y
	 */
	static fromPos(x, y) {
		return new Vector("xy", x, y);
	}

	/** @param {number} deg */
	static fromDeg(deg) {
		return new Vector("deg", 1, deg);
	}

	/** @param {number} rad */
	static fromRad(rad) {
		return new Vector("rad", 1, rad);
	}

	/**
	 * Return the average beween two angles (in radians) 
	 * @param {number} rad1 
	 * @param {number} rad2 
	 * @returns {number}
	 */
	static averageRad(rad1, rad2) {
		rad1 %= 2 * Math.PI;
		rad2 %= 2 * Math.PI;

		let angle = (rad1 + rad2) / 2;

		if (Math.abs(rad2 - rad1) > Math.PI) angle += Math.PI;

		return angle;
	}

	/**
	 * Return the average beween two angles (in degrees) 
	 * @param {number} deg1 
	 * @param {number} deg2 
	 * @returns {number}
	 */
	static averageDeg(deg1, deg2) {
		deg1 %= 360;
		deg2 %= 360;

		let angle = (deg1 + deg2) / 2;

		if (Math.abs(deg2 - deg1) > 180) angle += 180;

		return angle;
	}

	/** @param {...Vector} vectors */
	static sumOf(...vectors) {
		let sum = { x: 0, y: 0 };

		for (let vector of vectors) {
			sum.x += vector.x;
			sum.y += vector.y;
		}

		return new Vector("xy", sum.x, sum.y);
	}

	/**
	 * Returns the dot product between two vectors
	 * @param {Vector} vector1
	 * @param {Vector} vector2
	 * @returns {Vector}
	 */
	static dotProduct(vector1, vector2) {
		return new Vector("xy", vector1.x * vector2.x, vector1.y * vector2.y);
	}

	/**
	 * Returns the cross-product between two vectors
	 * @param {Vector} vector1 
	 * @param {Vector} vector2 
	 * @returns {number}
	 */
	static crossProduct(vector1, vector2) {
		return (vector1.x * vector2.y) - (vector1.y * vector2.x);
	}

	/** @param {"xy"|"deg"|"rad"|null} mode */
	toString(mode) {
		switch (mode ?? this.#defaultMode) {
			case "deg":
				return `(${this.#mag} \u2220${this.#deg}deg)`;
			case "rad":
				return `(${this.#mag} \u2220${this.#rad}rad)`;
			case "xy":
				return `(${this.x}, ${this.y})`;
		}
	}
}