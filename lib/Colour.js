import { range } from "./Range.js";

/**
 * @typedef HexCode
 * @type {string}
 * 
 * Begins with "#", uppercause
 */

/**
 * @typedef RgbCode
 * @type {object}
 * 
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * 
 * All channels are in the range 0-255
 */

export default class Colour {
	/** @type {HEX} */
	#hex = "#FFFFFF";

	/**
	 * @param {HEX|RGB|HSL} param
	 */
	constructor(param) {
		if (typeof param == "string") {
			// Assume HEX
			this.hex = param;
		} else if (param?.r && param?.g && param?.b) {
			// Assume RGB
			this.rgb = param;
		} else if (param?.h && param?.s && param?.l) {
			this.hsl = param;
		}
	}

	/**
	 * Hex code (starts with "#", uppercase)
	 * @returns {HEX}
	 */
	get hex() {
		return this.#hex;
	}
	/** @param {HEX|string} string Uppercase or lowercase Optional "#" at begining*/
	setHex(string) {
		string = string.replace(/^#/, "");

		if (string.length == 3) {
			string =
				string[0] + string[0] + // Red
				string[1] + string[1] + // Green
				string[2] + string[2]   // Blue
		}

		while (string.length < 6) string += "0";

		this.#hex = "#" + string.substring(0, 6).toUpperCase();
	}

	/**
	 * Red (r), Green (g), Blue (b) in range of 0-255
	 * @returns {{r: number, g: number, b: number}}
	 */
	get rgb() {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.#hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : { r: 0, g: 0, b: 0 };
	}
	/**
	 * @param {number} r In range of 0-255
	 * @param {number} g In range of 0-255
	 * @param {number} b In range of 0-255
	 */
	setRgb(r, g, b) {
		r = range.clamp(0, r, 255);
		g = range.clamp(0, g, 255);
		b = range.clamp(0, b, 255);
	
		function toHex(c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		}

		this.#hex = "#" + toHex(r) + toHex(g) + toHex(b);
	}

	/**
	 * Hue (h) in range of 0-360
	 * 
	 * Saturation (s) and Lightness (l) in range of 0-100
	 */
	get hsl() {
		let { r, g, b } = this.rgb;
		r /= 255, g /= 255, b /= 255;

		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		}
		h = Math.round(h * 360);
		s = Math.round(s * 100);
		l = Math.round(l * 100);
		return { h, s, l };
	}
	/**
	 * @param {number} h In range of 0-360
	 * @param {number} s In range of 0-100
	 * @param {number} l In range of 0-100
	 */
	setHsl(h, s, l) {
		h /= 360;
		s /= 100;
		l /= 100;

		var r, g, b;

		if (s == 0) {
			r = g = b = l; // achromatic
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * 6 * (2/3 - t);
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;

			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		r = Math.round(r * 255);
		g = Math.round(g * 255);
		b = Math.round(b * 255);
		this.setRgb(r, g, b);
	}

	/**
	 * @param {string|null|undefined} colour 
	 * @returns {{ r:number, g:number, b:number, a:number }}
	 */
	static parseColour(colour) {

		if (["", "none", null, undefined].includes(colour)) {
			colour = "transparent";
		} else if (colour instanceof CanvasGradient || colour instanceof CanvasPattern) {
			colour = "transparent";
		}

		let canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;

		let context = canvas.getContext("2d");
		context.fillStyle = colour;

		context.fillRect(0, 0, 1, 1);

		let imageData = context.getImageData(0, 0, 1, 1);

		return { r: imageData.data[0], g: imageData.data[1], b: imageData.data[2], a: imageData.data[3] }
	}

}