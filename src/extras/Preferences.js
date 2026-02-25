export default class TBPreferences {
	
	/**
	 * @type {TBPreferenceValue[]}
	 */
	#values = [];

	/** @param {{key: string, value: *}} preference */
	setDefault(preference) {
		let index = this.#values.findIndex((pref) => {
			return pref.key == preference.key
		});
		if (index >= 0) this.#values.splice(index, 1);

		this.#values.push( new TBPreferenceValue(preference.key, preference.value) );
	}

	/**
	 * @param {string} key
	 * @returns {*}
	 */
	get(key) {
		let preference = this.#values.find((pref) => {
			return pref.key == key;
		});

		return preference.value;
	}

	/**
	 * 
	 * @param {string} key
	 * @param {*} value
	 */
	set(key, value) {
		let preference = this.#values.find((pref) => {
			return pref.key == key;
		});
		preference.value = value;
	}
}

class TBPreferenceValue {
	key = "";
	defaultValue;

	/**
	 * 
	 * @param {string} key
	 * @param {*} defaultValue
	 */
	constructor(key, defaultValue) {
		this.key = key;
		this.defaultValue = defaultValue;
	}

	get value() {
		let value = localStorage.getItem(`preference>${key}`);
		try {
			if (typeof this.defaultValue == "object") {
				value = JSON.parse(value);
			} else if (typeof this.defaultValue == "number") {
				value = parseFloat(value);
			}
		} catch(e) {

		}
		return value ?? this.defaultValue;
	}

	set value(value) {
		localStorage.setItem(`preference>${key}`, JSON.stringify(value));
	}
}