/**
 * @typedef {{
 * 	once?:boolean,
 * 	passive?:boolean
 * }} TBKeyboardOptions
 */

export default new class TBKeyboard {

	/** @param {string} key */
	isKeyPressed(key) {
		key = key.toLowerCase();
		return this.#keys.includes(key);
	}

	/** @type {string[]} */
	#keys = [];

	debug = false;

	constructor() {
		window.addEventListener("keydown", (e) => {
			if (e.repeat == true) return;
			let key = e.key.toLowerCase();
			let index = this.#keys.indexOf(key);
			if (index != -1) return;
			this.#keys.push(key);
			this.#triggerEvents("down", e);
			if (this.debug) console.log("key:"+key+" DOWN", this.#keys);
		});
		window.addEventListener("keyup", (e) => {
			let key = e.key.toLowerCase();
			let index = this.#keys.indexOf(key);
			if (index == -1) return;
			this.#triggerEvents("up", e);
			this.#keys.splice(index, 1);
			if (this.debug) console.log("key:"+key+" UP", this.#keys);
		});
	}

	/**
	 * @type {{
	 * kind: "up" | "down"
	 * keys: string[],
	 * callback: (e:KeyboardEvent)=>{},
	 * options: TBKeyboardOptions
	 * }[]}
	 */
	#events = [];

	/**
	 * Listens for key-down events
	 * @param {string[]|string} keys A single key, or a list of keys
	 * @param {(e:KeyboardEvent)=>{}} callback
	 * @param {?TBKeyboardOptions} options
	 */
	on(keys, callback, options) {
		if (typeof keys == "string") keys = [keys];
		options = {
			once: options?.once ?? false,
			passive: options?.passive ?? true
		};
		this.#events.push({ kind: "down", keys, callback, options });
	}

	/**
	 * Listens for key-up events
	 * @param {string[]|string} keys A single key, or a list of keys
	 * @param {(e:KeyboardEvent)=>{}} callback
	 * @param {?TBKeyboardOptions} options
	 */
	off(keys, callback, options) {
		if (typeof keys == "string") keys = [keys];
		options = {
			once: options?.once ?? false,
			passive: options?.passive ?? true
		};
		this.#events.push({ kind: "up", keys, callback, options });
	}

	/**
	 * @param {"up" | "down"} kind
	 * @param {KeyboardEvent} e
	 */
	#triggerEvents(kind, e) {
		/** @type {number[]} */
		let indexesToBeRemoved = [];

		for (let eventListener of this.#events) {
			if (eventListener.kind != kind) continue;
			if (arraysEqual(this.#keys, eventListener.keys) == false) continue;
			if (eventListener.passive) e.preventDefault();
			eventListener.callback(e);
			if (eventListener.options.once) indexesToBeRemoved.push(i);
		}

		if (indexesToBeRemoved.length == 0) return;

		for (let i = 0; i < indexesToBeRemoved.length; i++) {
			this.#events.splice(indexesToBeRemoved[i], 1);
		}
	}
}

/**
 * 
 * @param {any[]} a
 * @param {any[]} b
 * @returns {boolean}
 */
function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	a.sort();
	b.sort();

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
 