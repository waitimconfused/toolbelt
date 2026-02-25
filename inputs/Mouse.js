/**
 * Gets the value of `PointerEvent.buttons`, and returns an object of `Object<string, boolean>`
 * @param {PointerEvent} event 
 * @returns {{left:boolean, right:boolean, wheel:boolean, back:boolean, forward:boolean, eraser:boolean}}
 */
function getMouseButtonsFromEvent(event) {
	let mouseButtonNames = [ "left", "right", "wheel", "back", "forward", "eraser" ];
	let object = {};
	for (const buttonName of mouseButtonNames) {
		let isPressed = Boolean(event.buttons & (1 << mouseButtonNames.indexOf(buttonName)));
		object[buttonName] = isPressed;
	}
	return object;
}

export default new class TBMouse {
	#position = { x: 0, y: 0 };

	get position() {  return this.#position; }
	/** Alias to: `mouse.position.x` */
	get x() { return this.#position.x; }
	/** Alias to: `mouse.position.y` */
	get y() { return this.#position.y; }


	#buttons = {
		left: false,
		right: false,
		wheel: false,
		back: false,
		forward: false
	}

	get buttons() { return this.#buttons; }

	/** Alias to: `Mouse.buttons.left` */
	get click_l() { return this.#buttons.left; }

	/** Alias to: `Mouse.buttons.right` */
	get click_r() { return this.#buttons.right; }

	preventContextMenu = false;
	preventScroll = true;


	#pen = {
		pressure: 0
	}
	get pen() { return this.#pen; }

	/** @type {"mouse"|"pen"|"touch"} */
	#pointerType = "mouse";
	get pointerType() { return this.#pointerType; }

	/** @type {MouseHook[]} */
	#hooks = [];

	constructor() {
		window.addEventListener("pointermove", (e) => {
			this.#update(e);
		});
		window.addEventListener("pointerdown", (e) => {
			this.#update(e);
		});
		window.addEventListener("pointerup", (e) => {
			this.#update(e);
		});
		window.addEventListener("scroll", (e) => {
			if (this.preventScroll == true) e.preventDefault();
			this.#update(e);
		})
		window.addEventListener("contextmenu", (e) => {
			if (this.preventContextMenu == true) e.preventDefault();
		});
	}

	/**
	 * 
	 * @param { object } options 
	 * @param { (e: MouseEvent, mouse: TBMouse) => {} } options.updateFunc
	 */
	addHook(options) {
		if (typeof options?.updateFunc != "function") options.updateFunc = new Function;
		let hook = new MouseHook({
			x: this.position.x,
			y: this.position.y,
			click_l: this.click_l,
			click_r: this.click_r,
			...options
		});
		this.#hooks.push(hook);
		return hook;
	}
	/**
	 * @param {MouseEvent} e
	 */
	#updateHooks(e) {
		for (let i = 0; i < this.#hooks.length; i++) {
			/** @type { MouseHook } */
			let hook = this.#hooks[i];
			hook.x = this.position.x;
			hook.y = this.position.y;
			hook.click_l = this.click_l;
			hook.click_r = this.click_r;
			hook.updateFunc(e, this);
		}
	}

	/** @param {PointerEvent} e */
	#update(e) {
		this.#pointerType = e.pointerType;
		
		let buttons = getMouseButtonsFromEvent(e);

		let trigger_onMove = (e.clientX != this.x || e.clientY != this.y);
		let trigger_onLClick = ( buttons.left && !this.#buttons.left );
		let trigger_onRClick = ( buttons.right && !this.#buttons.right );
		let trigger_onWClick = ( buttons.wheel && !this.#buttons.wheel );

		let trigger_offLClick = false;
		let trigger_offRClick = false;
		let trigger_offWClick = false;

		if ( !buttons.left && this.#buttons.left ) trigger_offLClick = true;
		if ( !buttons.right && this.#buttons.right ) trigger_offRClick = true;
		if ( !buttons.wheel && this.#buttons.wheel ) trigger_offWClick = true;
		
		this.#position.x = e.clientX;
		this.#position.y = e.clientY;
		
		if (e.pointerType == "mouse") {
			this.#buttons.left = buttons.left;
			this.#buttons.right = buttons.right;
			this.#buttons.wheel = buttons.wheel;
			this.#pen.pressure = 0;
			this.#pen.tiltX = 0;
			this.#pen.tiltY = 0;
		} else if (e.pointerType == "pen") {
			this.#buttons.left = false;
			this.#buttons.right = false;
			this.#buttons.wheel = false;
			this.#pen.pressure = e.pressure;
			this.#pen.tiltX = e.tiltX;
			this.#pen.tiltY = e.tiltY;
		}
		
		if (trigger_onMove) this.#triggerEvents("on", "move", e);
		if (trigger_onLClick) this.#triggerEvents("on", "lclick", e);
		if (trigger_onRClick) this.#triggerEvents("on", "rclick", e);
		if (trigger_onWClick) this.#triggerEvents("on", "wclick", e);
		if (trigger_onLClick || trigger_onRClick || trigger_onWClick) this.#triggerEvents("on", "click", e);
	
		if (trigger_offLClick) this.#triggerEvents("off", "lclick", e);
		if (trigger_offRClick) this.#triggerEvents("off", "rclick", e);
		if (trigger_offWClick) this.#triggerEvents("off", "wclick", e);
		if (trigger_offLClick || trigger_offRClick || trigger_offWClick) this.#triggerEvents("off", "click", e);

		this.#updateHooks(e);
	}

	/**
	 * @param {"on"|"while"|"off"} mode
	 * @param {"move"|"click"|"lclick"|"rclick"} type
	 * @param {MouseEvent} event 
	 */
	#triggerEvents(mode, type, event) {
		let mouseEvents = this.#events.filter((mouseEvent) => {
			return mouseEvent.mode == mode && mouseEvent.type == type;
		});

		for (let mouseEvent of mouseEvents) {
			mouseEvent.callback(event, this, mouseEvent);
		}
	}

	/**
	 * @typedef TBMouseEvent
	 * @type {object}
	 * @prop {"on" | "off"} mode
	 * @prop {string} id Used in `mouse.removeEventListener(id)`
	 * @prop {"move" | "click" | "lclick" | "rclick"} type
	 * @prop {(e:MouseEvent, mouse:TBMouse, mouseEvent: TBMouseEvent)=>{}} callback
	 */

	/**
	 * @type {TBMouseEvent[]}
	*/
	#events = [];

	get events() { return this.#events; }


	/**
	 * 
	 * @param {"move" | "click" | "lclick" | "rclick"} eventType
	 * @param {(e:MouseEvent, mouse:TBMouse, mouseEvent: TBMouseEvent)=>{}} callback
	 * @returns {TBMouseEvent} A **copy** of the created event. Used for `mouse.removeEventListener(event)`
	 */
	on(eventType, callback) {
		let id = Math.floor().toString(16);
		let mouseEvent = { mode: "on", id, type: eventType, callback };
		this.#events.push(mouseEvent);
		return mouseEvent;
	}

	/**
	 * 
	 * @param {"click" | "lclick" | "rclick"} eventType
	 * @param {(e:MouseEvent, mouse:TBMouse, mouseEvent: TBMouseEvent)=>{}} callback
	 * @returns {TBMouseEvent} A **copy** of the created event. Used for `mouse.removeEventListener(event)`
	 */
	off(eventType, callback) {
		let id = Math.floor().toString(16);
		let mouseEvent = { mode: "off", id, type: eventType, callback };
		this.#events.push(mouseEvent);
		return mouseEvent;
	}

	/**
	 * @param {TBMouseEvent|string} identifier Either `TBMouseEvent` or `TBMouseEvent.id`
	 */
	removeListener(identifier) {

		if (typeof identifier == "object") {
			let index = this.#events.indexOf(identifier);
			this.#events.splice(index, 1);
		} else if (typeof identifier == "string") {
			let mouseEvent = this.#events.find((mouseEvent) => {
				return mouseEvent.id = id;
			});
	
			let index = this.#events.indexOf(mouseEvent);
			this.#events.splice(index, 1);
		} else throw new Error("Cannot remove event-listener if the identifier is not of type `TBMouseEvent` or `string`.")

	}


	/**
	 * 
	 * @param {HTMLElement} element
	 */
	toElement(element) {
		let elementRect = element.getBoundingClientRect();

		let x = this.#position.x - elementRect.left;
		let y = this.#position.y - elementRect.top;

		let renderedWidth = elementRect.width;
		let renderedHeight = elementRect.height;

		renderedWidth = element.offsetWidth;

		let actualWidth = element.getAttribute("width") || element.clientWidth;
		let actualHeight = element.getAttribute("height") || element.clientWidth;
		if (element.nodeName.toLowerCase() == "svg") {
			let veiwbox = element.getAttribute("viewBox").split(" ");
			actualWidth = veiwbox[2];
			actualHeight = veiwbox[3];
		}

		var scaleX = renderedWidth / actualWidth;
		var scaleY = renderedHeight / actualHeight;

		x /= scaleX;
		y /= scaleY;
		return { x, y };
	}

}

class MouseHook {
	x = 0;
	y = 0;
	click_l = false;
	click_r = false;

	/**
	 * @param { object} options
	 * @param { function } options.
	 */
	constructor(options) {
		for (let key in options) {
			if (["x", "y"].includes(key)) continue;
			this[key] = options[key];
		}
	}
}