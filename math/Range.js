export const range = {

	/**
	 * 
	 * @param {number} min
	 * @param {number} number
	 * @param {number} max
	 * @returns {number}
	 */
	clamp(min, number, max) {
		return Math.max(Math.min(number, max), min);
	},

	/**
	 * Detect if any number is within the range [min, max]
	 * @param {number} min
	 * @param {number} number
	 * @param {number} max
	 * @returns  {boolean}
	 */
	fits(min, number, max) {
		return number >= min && number <= max;
	},

	/**
	 * Returns a random number in the range [min, max]
	 * @param {number} min
	 * @param {number} max
	 * @param {?boolean} asInt
	 * @returns {number}
	 */
	random(min, max, asInt) {
		let value = Math.random() * (max - min) + min;
		if (asInt) value = Math.round(value);
		return value;
	},

	/**
	 * Returns the sine of a number, scaled to fit range
	 * @param {number} min
	 * @param {number} max
	 * @param {number} number
	 * @returns {number}
	 */
	sin(min, max, number) {
		if (min > max) max = [min, min = max][0];

		let scale = Math.abs( (max-min) / 2 );
		let offset = (max+min)/2;
		return scale * Math.sin(number) + offset;
	},

	/**
	 * Returns the cosine of a number, scaled to fit range
	 * @param {number} min
	 * @param {number} max
	 * @param {number} number
	 * @returns {number}
	 */
	cos(min, max, number) {
		if (min > max) max = [min, min = max][0];

		let scale = Math.abs( (max-min) / 2 );
		let offset = (max+min)/2;
		return scale * Math.cos(number) + offset;
	},

	/**
	 * Computes a modulo operation that wraps values within a custom range `[a, b]`.
	 *
	 * This function ensures that the result cycles between `a` and `b`, instead of defaulting
	 * to the standard `n%x` operator behavior range of `[0,x]`.
	 * 
	 * @param {number} min 
	 * @param {number} value 
	 * @param {number} max 
	 * @returns {number}
	 */
	mod(min, value, max) {
		return min + ( (value-min) % (max-min) );
	},

	/**
	 * Linear interpolation between `min` and `max`
	 * @param {number} min 
	 * @param {number} max 
	 * @param {number} percentage Percentage in the form of 0-1, but all values are accepted
	 */
	lerp(min, max, percentage) {
		return min + (max - min) * percentage;
	}
}

export const round = {

	round: Math.round,
	floor: Math.floor,
	ceil: Math.ceil,

	roundToNearest(number=3.14, step=1) {
		let rounded = Math.round(number / step) * step;
		if (`${rounded}`.includes(".")) {
			let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
			rounded = rounded.toFixed(step_decimalNumbers)
		}
		return rounded;
	},
	
	floorToNearest(number = 3.14, nearest = 1) {
		let rounded = Math.floor(number / step) * step;
		if (`${rounded}`.includes(".")) {
			let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
			rounded = rounded.toFixed(step_decimalNumbers)
		}
		return rounded;
	},
	
	ceilToNearest(number = 3.14, nearest = 1) {
		let rounded = Math.ceil(number / step) * step;
		if (`${rounded}`.includes(".")) {
			let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
			rounded = rounded.toFixed(step_decimalNumbers)
		}
		return rounded;
	},
}