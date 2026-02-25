var initialized = false;
var freeze = false;

/** @type {Controller[]} */
export var controllers = [];

/**
 * @typedef {string} ControllerButton
 * A string that represents the current controller mapping.
 * 
 * EG: `"button.0"`, `"button.BUTTON_NAME"`, `"axis.0"`, `"axis.AXIS_NAME.x"`
 * 
 * See: `Controller.mappings`
 */

export class Controller {

	/** @type {?number} */
	index = null;

	/** @type {?Gamepad} */
	rawGamepad = null;

	get vibrator() { return this.rawGamepad.vibrationActuator ?? null; }
	get supportsVibration() { return !!this.rawGamepad.vibrationActuator }
	get id() { return this.rawGamepad.id; }
	get timestamp() { return this.rawGamepad.timestamp; }
	get connected() { return this.rawGamepad?.connected ?? false; }
	get mapping() { return this.rawGamepad.mapping; }

	/**
	 * @type {?{axes:Object<number,string>, buttons:Object<number,string>}}
	 * Represents a way of mapping the `Gamepad.axes` and `Gamepad.buttons` to a simplified and customizable `Controller.values` object.
	 * 
	 * EG:
	 * 
	 * Using raw `Gamepad`:
	 * ```js
	 * let gamepad:Gamepad;
	 * 
	 * if (gamepad.buttons[0]) {
	 * 	console.log("Button XYZ pressed!");
	 * }
	 * ```
	 * 
	 * Using `Controller`:
	 * ```js
	 * let controller:Controller;
	 * 
	 * if (controller.button.XYZ) {
	 * 	console.log("Button XYZ pressed!");
	 * }
	 * ```
	 * 
	 * The difference is that using `Controller`, each individual button and axis can be named, instead of read by an index
	 */
	mappings = null;

	values = {
		/** @type {number[]} */
		axis: [],

		/** @type {{pressed:boolean, value:number}[]} */
		button: []
	};

	/** Reference to: `Controller.values.axis` */
	get axis() { return this.values.axis; }
	/** Reference to: `Controller.values.button` */
	get button() { return this.values.button }

	/** @type {ControllerListener[]} */
	#eventListeners = [];

	/** @type {number} Represents the amount of decimal places values should have. *Example usecase: Axes values* */
	accuracy = 5;

	/** @param {?number} index */
	constructor(index) {
		this.index = index ?? controllers.length;
		controllers.push(this);
		Controller.initialize();
	}

	/**
	 * @type {?{
	 * 	status: (eventName:"connect"|"disconnect", callback:(event:GamepadEvent)=>void) => ControllerListener,
	 * 	on: (eventName:ControllerButton, callback:(button:ControllerButton, value:number)=>void) => ControllerListener,
	 * 	while: (eventName:ControllerButton, callback:(value:number)=>void) => ControllerListener,
	 * 	stateChange: (eventName:ControllerButton, callback:(value:number)=>void) => ControllerListener,
	 * 	off: (eventName:ControllerButton, callback:(value:number)=>void) => ControllerListener,
	 * }}
	 */
	#listener;

	/**
	 * Attach an event listener to the current gamepad controller
	 */
	get listener() {

		if (this.#listener) return this.#listener;

		/**
		 * @param {"status"|"on"|"while"|"statechange"|"off"} specific
		 * @param {string} eventName
		 * @param {(value:number)=>void} callback
		 */
		let createEventListener = (specific, eventName, callback) => {
			if (typeof eventName != "string") throw TypeError("Unexpected type of parameter. The parameter eventName must be of type string");
			if (typeof callback != "function") throw TypeError("Unexpected type of parameter. The parameter callback must be of type funcion");
			let listener = new ControllerListener(this, specific, eventName, callback);
			this.#eventListeners.push(listener);
			return listener;
		}

		this.#listener = Object.freeze({
			/** Listens for controller connection or disconnection @param {"connect"|"disconnect"} eventName @param {(event:GamepadEvent)=>void} callback */
			status(eventName, callback) {
				return createEventListener("status", eventName, callback)
			},
			
			/** Listens for a controller button/axis@param {ControllerButton} eventName @param {(value:number)=>void} callback */
			on(eventName, callback) {
				return createEventListener("on", eventName, callback)
			},
			
			/** @param {ControllerButton} eventName @param {(value:number)=>void} callback */
			while(eventName, callback) {
				return createEventListener("while", eventName, callback)
			},
			
			/** @param {ControllerButton} eventName @param {(value:number)=>void} callback */
			stateChange(eventName, callback) {
				return createEventListener("statechange", eventName, callback)
			},

			/** @param {ControllerButton} eventName @param {(value:number)=>void} callback */
			off(eventName, callback) {
				return createEventListener("off", eventName, callback)
			},

			/** @param {ControllerListener} listener */
			removeListener: (listener) => {
				let index = this.#eventListeners.findIndex((l) => {
					return l.uniqueID == listener.uniqueID;
				});
				if (index == -1) return false;
				this.#eventListeners.splice(index, 1);
				return true;
			}
		});
		return this.#listener;
	}

	/**
	 * Trigger a gamepad controller event listener.
	 * @param {string} eventName
	 */
	triggerEvent(eventName, params) {
		if (typeof eventName != "string") throw new Error ("Parameter 'eventName' must be a string in 'Controller.triggerEvent'");
		let eventType = eventName.split(":")[0]
		eventName = eventName.split(":")[1] || null;
		if(!eventName) {
			eventName = eventType;
			eventType = "on";
		}
		eventType = eventType.toLowerCase();

		for (let listener of this.#eventListeners) {
			if (listener.specific != eventType) continue;
			if (listener.type != eventName && listener.type != "*") continue;

			listener.callback(eventName, params);
		}
	}

	/**
	 * Reload all gamepad controller button and axis values
	 * @param {Gamepad} gamepad
	 */
	reload(gamepad) {

		if(gamepad instanceof Gamepad == false) throw new Error("Function 'XboxController.reload()' requires the parameter 'gamepad:Gamepad'");

		this.rawGamepad = gamepad;

		if (!this?.mappings) {
			this.mappings = { buttons: [], axes: [] };
			for (let b = 0; b < gamepad.buttons.length; b ++) this.mappings.buttons[b] = "button."+b;
			for (let a = 0; a < gamepad.axes.length; a ++) this.mappings.axes[a] = "axis."+a;
		}

		for (let i in gamepad.buttons) {

			let mapping = this.mappings.buttons[i];

			let currentValue = getValueByPath(this.values, mapping);
			let newValue = gamepad.buttons[i];

			if (currentValue == undefined) currentValue = 0;

			if (typeof currentValue == "boolean") {
				newValue = newValue.pressed;

				if (!currentValue && newValue) this.triggerEvent("ON:"+mapping, true);
				if (currentValue && newValue) this.triggerEvent("WHILE:"+mapping, true);
				if (currentValue != newValue) this.triggerEvent("STATECHANGE:"+mapping, newValue);
				if (currentValue && !newValue) this.triggerEvent("OFF:"+mapping, false);
				
			} else if (typeof currentValue == "number") {
				newValue = newValue.value;
				
				if (this.accuracy != 0) {
					currentValue = Number( currentValue.toFixed( Math.ceil(this.accuracy) ) );
					newValue = Number( newValue.toFixed( Math.ceil(this.accuracy) ) );
				}


				if (currentValue == 0 && newValue != 0) this.triggerEvent("ON:"+mapping, newValue);
				if (currentValue != 0 && newValue != 0) this.triggerEvent("WHILE:"+mapping, newValue);
				if (currentValue != newValue) this.triggerEvent("STATECHANGE:"+mapping, newValue);
				if (currentValue != 0 && newValue == 0) this.triggerEvent("OFF:"+mapping, 0);

			}

			setValueByPath(this.values, mapping, newValue);
		}

		for (let i in gamepad.axes) {
			let mapping = this.mappings.axes[i];

			/** @type {number} */
			let currentValue = getValueByPath(this.values, mapping);
			let newValue = gamepad.axes[i];

			if (currentValue == undefined) currentValue = 0;

			if (this.accuracy != 0) {
				// let accuracy10 = this.accuracy * 10;
				// currentValue = Math.round(currentValue * accuracy10) / accuracy10;
				// newValue = Math.round(newValue * accuracy10) / accuracy10;
				currentValue = Number( currentValue.toFixed( Math.ceil(this.accuracy) ) );
				newValue = Number( newValue.toFixed( Math.ceil(this.accuracy) ) );
			}

			if (currentValue == 0 && newValue != 0) this.triggerEvent("ON:"+mapping, newValue);
			if (currentValue != 0 && newValue != 0) this.triggerEvent("WHILE:"+mapping, newValue);
			if (currentValue != newValue) this.triggerEvent("STATECHANGE:"+mapping, newValue);
			if (currentValue != 0 && newValue == 0) this.triggerEvent("OFF:"+mapping, 0);
			

			setValueByPath(this.values, mapping, newValue);
		}
	}

	/**
	 * Initialize the event listeners, and start the update ticker
	 * 
	 * Can/will only be ran once
	 */
	static initialize() {
		if (initialized) return;
		initialized = true;
	
		console.info("Listening for controller connection(s)...");
		window.addEventListener("gamepadconnected", (e) => {
	
			/** @type {Controller[]} */
			let gamepadListeners = controllers.filter((elem) => !!elem).filter((listener) => {
				return listener.index == e.gamepad.index;
			});

			console.info(`Gamepad at index ${e.gamepad.index} connected with id: ${e.gamepad.id}`);

			for (let i = 0; i < gamepadListeners.length; i ++) {
				let gamepadListener = gamepadListeners[i];
				gamepadListener.reload(e.gamepad);
				gamepadListener.triggerEvent("STATUS:connect");
			}
	
		});
	
	
		window.addEventListener("gamepaddisconnected", (e) => {
	
			let gamepadListeners = controllers.filter((elem) => !!elem).filter((listener=new Controller) => {
				return listener.index == e.gamepad.index;
			});
			for (let i = 0; i < gamepadListeners.length; i ++) {
				let gamepadListener = gamepadListeners[i];
				gamepadListener.triggerEvent("STATUS:disconnect");
			}
			console.info(`Gamepad at index ${e.gamepad.index} disconnected with id: ${e.gamepad.id}`);
		});
	
		tick();
	}

	static layout = {
		/** @param {?number} index */
		Default: (index) => new Controller(index),
		Xbox: XboxController
	};
}

class ControllerListener {
	/** @type {"on"|"while"|"statechange"|"off"|"status"} */
	specific = "";

	/** @type {string} */
	type = "button.0";

	callback = () => {};

	/** @type {?Controller} */
	#parent = null;

	#uniqueID = 0;
	get uniqueID() { return this.#uniqueID; }

	/**
	 * @param {Controller} parentController
	 * @param {"on"|"while"|"statechange"|"off"|"status"} specific 
	 * @param {string} type 
	 * @param {(...params)=>void} callback 
	 */
	constructor(parentController, specific, type, callback) {
		let listOfSpecifics = ["on", "while", "statechange", "off", "status"];
		if (listOfSpecifics.includes(specific) == false) throw new Error(`Unknown ControllerListener specific of ${JSON.stringify(specific)}`);
		this.#parent = parentController;
		this.specific = specific;
		this.type = type;
		this.callback = callback;
		
		let uniqueIdLength = 16;
		this.#uniqueID = Math.random().toString(36).substring(2, uniqueIdLength + 2);
	}

	destroy() {
		this.#parent.listener.removeListener(this);
	}
}

function tick() {

	if (freeze) return;

	let gamepads = navigator.getGamepads().filter((obj) => !!obj);

	for (let i = 0; i < gamepads.length; i ++) {
		let gamepad = gamepads[i];
		if(!gamepad) continue;

		let gamepadListeners = controllers.filter((listener) => {
			return listener.index == gamepad.index;
		});
		for(let idx = 0; idx < gamepadListeners.length; idx ++){
			let gamepadListener = gamepadListeners[idx];

			gamepadListener.reload(gamepad);
		}
	}

	window.requestAnimationFrame(tick);
}

document.addEventListener("visibilitychange", (event) => {
	if (document.visibilityState == "visible") {
		freeze = false;
		window.requestAnimationFrame(tick);
	} else {
		freeze = true;
	}
});

/**
 * @param {object} object
 * @param {string} path
 * @param {*} value
 */
function setValueByPath(object, path, value) {
	let keys = path.split(".");
	let current = object;

	for (let i = 0; i < keys.length-1; i++) {
		if (keys[i] in current == false) {
			throw new Error(`Unknown path ${JSON.stringify(path)} in XboxController`);
		}
		current = current[keys[i]];
	}

	current[keys[keys.length-1]] = value;
}

/**
 * @param {object} object
 * @param {string} path
 * @returns {*}
 */
function getValueByPath(object, path) {
	let keys = path.split(".");
	let value = object;

	for (let key of keys) {
		if (value && key in value) {
			value = value[key];
		} else if (value && Number(key) in value) {
			value = value[ Number(key) ];
		} else {
			return undefined;
		}
	}

	return value;
}

/** @returns {Controller} */
function XboxController(index) {
	let controller = new Controller(index);
	controller.mappings = {
		buttons: {
			0: "button.A", 1: "button.B", 2: "button.X", 3: "button.Y",
			4: "bumper.left", 5: "bumper.right", 6: "trigger.left",
			7: "trigger.right", 8: "button.view", 9: "button.menu",
			10: "joystick.left.click", 11: "joystick.right.click",
			12: "dpad.up", 13: "dpad.down", 14: "dpad.left",
			15: "dpad.right", 16: "button.guide",
		},
		axes: {
			0: "joystick.left.x", 1: "joystick.left.y",
			2: "joystick.right.x", 3: "joystick.right.y"
		}
	};
	controller.values = {
		joystick: {
			left: { x: 0, y: 0, click: false },
			right: { x: 0, y: 0, click: false }
		},
		button: {
			A: false, B: false, X: false, Y: false,
			view: false, menu: false, guide: false
		},
		bumper: { left: false, right: false },
		trigger: { left: 0, right: 0 },
		dpad: { up: false, down: false, left: false, right: false }
	};

	return controller;
}