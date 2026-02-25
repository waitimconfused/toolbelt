class TBUnitConverter {
	/**
	 * @type {{unit: string, callback: (value: number) => number}[]}
	 */
	units = [];

	/**
	 * @param {string} unit
	 * @param {(value: number) => number} callback
	 */
	defineUnit(unit, callback) {
		this.units.push({unit, callback});
	}

	/**
	 * @param {number | string} value
	 * @returns {number}
	 */
	getValue(value, ...params) {
		if (typeof value != "string") return value;
		/** @type {string[]} */
		let sections = value.split(/([0-9\.-]+[a-zA-Z]*)/g).filter((a) => !!a);
	
		let output = "";
		for (let i = 0; i < sections.length; i ++) {
			sections[i] = sections[i].replaceAll(" ", "");
			let section = sections[i];
			let unit = this.units.find((unit) => {
				return unit.unit == section.replace(/[^a-zA-Z]/g, "");
			})
			if (unit) {
				let number = parseFloat(section);
				section = unit.callback(number, ...params);
			}
	
			output += `${section}`;
		}
		return this.#parse(output);
	}

	#parse(string) {
		return Function(`\t'use strict';\n\treturn (${string});`)();
	}
}

export default new TBUnitConverter;

export const unitConverter = new TBUnitConverter;

export const getValue = function(value, ...params) {
	return unitConverter.getValue(value, ...params)
};