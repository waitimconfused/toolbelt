(() => {
  // src/math/Range.js
  var range = {
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
      let value2 = Math.random() * (max - min) + min;
      if (asInt) value2 = Math.round(value2);
      return value2;
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
      let scale = Math.abs((max - min) / 2);
      let offset = (max + min) / 2;
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
      let scale = Math.abs((max - min) / 2);
      let offset = (max + min) / 2;
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
    mod(min, value2, max) {
      return min + (value2 - min) % (max - min);
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
  };
  var round = {
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    roundToNearest(number = 3.14, step2 = 1) {
      let rounded = Math.round(number / step2) * step2;
      if (`${rounded}`.includes(".")) {
        let step_decimalNumbers = `${step2}`.replace(/(\d*)\./, "").length;
        rounded = rounded.toFixed(step_decimalNumbers);
      }
      return rounded;
    },
    floorToNearest(number = 3.14, nearest = 1) {
      let rounded = Math.floor(number / step) * step;
      if (`${rounded}`.includes(".")) {
        let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
        rounded = rounded.toFixed(step_decimalNumbers);
      }
      return rounded;
    },
    ceilToNearest(number = 3.14, nearest = 1) {
      let rounded = Math.ceil(number / step) * step;
      if (`${rounded}`.includes(".")) {
        let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
        rounded = rounded.toFixed(step_decimalNumbers);
      }
      return rounded;
    }
  };

  // src/extras/Colour.js
  var Colour = class {
    /** @type {HEX} */
    #hex = "#FFFFFF";
    /**
     * @param {HEX|RGB|HSL} param
     */
    constructor(param) {
      if (typeof param == "string") {
        this.hex = param;
      } else if (param?.r && param?.g && param?.b) {
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
        string = string[0] + string[0] + // Red
        string[1] + string[1] + // Green
        string[2] + string[2];
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
        h = s = 0;
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
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
        r = g = b = l;
      } else {
        let hue2rgb = function(p2, q2, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
          if (t < 1 / 2) return q2;
          if (t < 2 / 3) return p2 + (q2 - p2) * 6 * (2 / 3 - t);
          return p2;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
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
      if (["", "none", null, void 0].includes(colour)) {
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
      return { r: imageData.data[0], g: imageData.data[1], b: imageData.data[2], a: imageData.data[3] };
    }
  };

  // src/inputs/Controller.js
  var initialized = false;
  var freeze = false;
  var controllers = [];
  var Controller = class _Controller {
    /** @type {?number} */
    index = null;
    /** @type {?Gamepad} */
    rawGamepad = null;
    get vibrator() {
      return this.rawGamepad.vibrationActuator ?? null;
    }
    get supportsVibration() {
      return !!this.rawGamepad.vibrationActuator;
    }
    get id() {
      return this.rawGamepad.id;
    }
    get timestamp() {
      return this.rawGamepad.timestamp;
    }
    get connected() {
      return this.rawGamepad?.connected ?? false;
    }
    get mapping() {
      return this.rawGamepad.mapping;
    }
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
    get axis() {
      return this.values.axis;
    }
    /** Reference to: `Controller.values.button` */
    get button() {
      return this.values.button;
    }
    /** @type {ControllerListener[]} */
    #eventListeners = [];
    /** @type {number} Represents the amount of decimal places values should have. *Example usecase: Axes values* */
    accuracy = 5;
    /** @param {?number} index */
    constructor(index) {
      this.index = index ?? controllers.length;
      controllers.push(this);
      _Controller.initialize();
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
      let createEventListener = (specific, eventName, callback) => {
        if (typeof eventName != "string") throw TypeError("Unexpected type of parameter. The parameter eventName must be of type string");
        if (typeof callback != "function") throw TypeError("Unexpected type of parameter. The parameter callback must be of type funcion");
        let listener = new ControllerListener(this, specific, eventName, callback);
        this.#eventListeners.push(listener);
        return listener;
      };
      this.#listener = Object.freeze({
        /** Listens for controller connection or disconnection @param {"connect"|"disconnect"} eventName @param {(event:GamepadEvent)=>void} callback */
        status(eventName, callback) {
          return createEventListener("status", eventName, callback);
        },
        /** Listens for a controller button/axis@param {ControllerButton} eventName @param {(value:number)=>void} callback */
        on(eventName, callback) {
          return createEventListener("on", eventName, callback);
        },
        /** @param {ControllerButton} eventName @param {(value:number)=>void} callback */
        while(eventName, callback) {
          return createEventListener("while", eventName, callback);
        },
        /** @param {ControllerButton} eventName @param {(value:number)=>void} callback */
        stateChange(eventName, callback) {
          return createEventListener("statechange", eventName, callback);
        },
        /** @param {ControllerButton} eventName @param {(value:number)=>void} callback */
        off(eventName, callback) {
          return createEventListener("off", eventName, callback);
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
      if (typeof eventName != "string") throw new Error("Parameter 'eventName' must be a string in 'Controller.triggerEvent'");
      let eventType = eventName.split(":")[0];
      eventName = eventName.split(":")[1] || null;
      if (!eventName) {
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
      if (gamepad instanceof Gamepad == false) throw new Error("Function 'XboxController.reload()' requires the parameter 'gamepad:Gamepad'");
      this.rawGamepad = gamepad;
      if (!this?.mappings) {
        this.mappings = { buttons: [], axes: [] };
        for (let b = 0; b < gamepad.buttons.length; b++) this.mappings.buttons[b] = "button." + b;
        for (let a = 0; a < gamepad.axes.length; a++) this.mappings.axes[a] = "axis." + a;
      }
      for (let i2 in gamepad.buttons) {
        let mapping = this.mappings.buttons[i2];
        let currentValue = getValueByPath(this.values, mapping);
        let newValue = gamepad.buttons[i2];
        if (currentValue == void 0) currentValue = 0;
        if (typeof currentValue == "boolean") {
          newValue = newValue.pressed;
          if (!currentValue && newValue) this.triggerEvent("ON:" + mapping, true);
          if (currentValue && newValue) this.triggerEvent("WHILE:" + mapping, true);
          if (currentValue != newValue) this.triggerEvent("STATECHANGE:" + mapping, newValue);
          if (currentValue && !newValue) this.triggerEvent("OFF:" + mapping, false);
        } else if (typeof currentValue == "number") {
          newValue = newValue.value;
          if (this.accuracy != 0) {
            currentValue = Number(currentValue.toFixed(Math.ceil(this.accuracy)));
            newValue = Number(newValue.toFixed(Math.ceil(this.accuracy)));
          }
          if (currentValue == 0 && newValue != 0) this.triggerEvent("ON:" + mapping, newValue);
          if (currentValue != 0 && newValue != 0) this.triggerEvent("WHILE:" + mapping, newValue);
          if (currentValue != newValue) this.triggerEvent("STATECHANGE:" + mapping, newValue);
          if (currentValue != 0 && newValue == 0) this.triggerEvent("OFF:" + mapping, 0);
        }
        setValueByPath(this.values, mapping, newValue);
      }
      for (let i2 in gamepad.axes) {
        let mapping = this.mappings.axes[i2];
        let currentValue = getValueByPath(this.values, mapping);
        let newValue = gamepad.axes[i2];
        if (currentValue == void 0) currentValue = 0;
        if (this.accuracy != 0) {
          currentValue = Number(currentValue.toFixed(Math.ceil(this.accuracy)));
          newValue = Number(newValue.toFixed(Math.ceil(this.accuracy)));
        }
        if (currentValue == 0 && newValue != 0) this.triggerEvent("ON:" + mapping, newValue);
        if (currentValue != 0 && newValue != 0) this.triggerEvent("WHILE:" + mapping, newValue);
        if (currentValue != newValue) this.triggerEvent("STATECHANGE:" + mapping, newValue);
        if (currentValue != 0 && newValue == 0) this.triggerEvent("OFF:" + mapping, 0);
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
        let gamepadListeners = controllers.filter((elem) => !!elem).filter((listener) => {
          return listener.index == e.gamepad.index;
        });
        console.info(`Gamepad at index ${e.gamepad.index} connected with id: ${e.gamepad.id}`);
        for (let i2 = 0; i2 < gamepadListeners.length; i2++) {
          let gamepadListener = gamepadListeners[i2];
          gamepadListener.reload(e.gamepad);
          gamepadListener.triggerEvent("STATUS:connect");
        }
      });
      window.addEventListener("gamepaddisconnected", (e) => {
        let gamepadListeners = controllers.filter((elem) => !!elem).filter((listener = new _Controller()) => {
          return listener.index == e.gamepad.index;
        });
        for (let i2 = 0; i2 < gamepadListeners.length; i2++) {
          let gamepadListener = gamepadListeners[i2];
          gamepadListener.triggerEvent("STATUS:disconnect");
        }
        console.info(`Gamepad at index ${e.gamepad.index} disconnected with id: ${e.gamepad.id}`);
      });
      tick();
    }
    static layout = {
      /** @param {?number} index */
      Default: (index) => new _Controller(index),
      Xbox: XboxController
    };
  };
  var ControllerListener = class {
    /** @type {"on"|"while"|"statechange"|"off"|"status"} */
    specific = "";
    /** @type {string} */
    type = "button.0";
    callback = () => {
    };
    /** @type {?Controller} */
    #parent = null;
    #uniqueID = 0;
    get uniqueID() {
      return this.#uniqueID;
    }
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
  };
  function tick() {
    if (freeze) return;
    let gamepads = navigator.getGamepads().filter((obj) => !!obj);
    for (let i2 = 0; i2 < gamepads.length; i2++) {
      let gamepad = gamepads[i2];
      if (!gamepad) continue;
      let gamepadListeners = controllers.filter((listener) => {
        return listener.index == gamepad.index;
      });
      for (let idx = 0; idx < gamepadListeners.length; idx++) {
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
  function setValueByPath(object, path, value2) {
    let keys = path.split(".");
    let current = object;
    for (let i2 = 0; i2 < keys.length - 1; i2++) {
      if (keys[i2] in current == false) {
        throw new Error(`Unknown path ${JSON.stringify(path)} in XboxController`);
      }
      current = current[keys[i2]];
    }
    current[keys[keys.length - 1]] = value2;
  }
  function getValueByPath(object, path) {
    let keys = path.split(".");
    let value2 = object;
    for (let key of keys) {
      if (value2 && key in value2) {
        value2 = value2[key];
      } else if (value2 && Number(key) in value2) {
        value2 = value2[Number(key)];
      } else {
        console.warn("Failed to get value from path", { path, object });
        return void 0;
      }
    }
    return value2;
  }
  function XboxController(index) {
    let controller = new Controller(index);
    controller.mappings = {
      buttons: {
        0: "button.A",
        1: "button.B",
        2: "button.X",
        3: "button.Y",
        4: "bumper.left",
        5: "bumper.right",
        6: "trigger.left",
        7: "trigger.right",
        8: "button.view",
        9: "button.menu",
        10: "joystick.left.click",
        11: "joystick.right.click",
        12: "dpad.up",
        13: "dpad.down",
        14: "dpad.left",
        15: "dpad.right",
        16: "button.guide"
      },
      axes: {
        0: "joystick.left.x",
        1: "joystick.left.y",
        2: "joystick.right.x",
        3: "joystick.right.y"
      }
    };
    controller.values = {
      joystick: {
        left: { x: 0, y: 0, click: false },
        right: { x: 0, y: 0, click: false }
      },
      button: {
        A: false,
        B: false,
        X: false,
        Y: false,
        view: false,
        menu: false,
        guide: false
      },
      bumper: { left: false, right: false },
      trigger: { left: 0, right: 0 },
      dpad: { up: false, down: false, left: false, right: false }
    };
    return controller;
  }

  // src/extras/Database.js
  var TBDatabase = class _TBDatabase {
    /** @type {IDBDatabase} */
    #database;
    /** @type {Object<string, TBStore>} */
    #stores = {};
    #version = 1;
    get version() {
      return this.#version;
    }
    /**
     * @param {string} databaseName
     * @param {string[]|string} storeNames Default table name(s). `Database.stores` may be different, depending on databases version
     * @param {number|1} version
     * 
     * ### Notes:
     * 
     * #### Opening a database
     * 
     * You must wait for the database to open. Use the `onopen` method to catch this. EG:
     * ```js
     * const db = new Database("database", ["store1"]);
     * 
     * db.getStore("store1"); // Returns null
     * 
     * db.onopen = () => {
     * 	db.getStore("store1"); // Returns Table
     * }
     * ```
     * Alternatively, you can use `await Database.new()` to avoid using the `onopen` method:
     * ```js
     * const db = await Database.new("database", ["store1"]);
     * db.getStore("store1"); // Returns Table
     * ```
     * 
     * #### Creating/removing stores
     * 
     * Stores can only be created and removed through the constructor param `storeNames:string[]`.
     * EG:
     * ```js
     * var db = new Database("database", ["store1", "store2"]);
     * 
     * db.onopen = () => {
     * 	db = new Database("database", ["store1"]); // Equivelent of removing "store2"
     * }
     * ```
     */
    constructor(databaseName, storeNames, version) {
      if (version <= 0) version = 1;
      if (typeof storeNames == "string") storeNames = [storeNames];
      indexedDB.databases().then((databaseList) => {
        let thisDatabase = databaseList.find((db) => db.name == databaseName);
        if (thisDatabase) {
          let request = indexedDB.open(databaseName, thisDatabase.version);
          request.onsuccess = (event) => {
            let database = event.target.result;
            if (arraysEqual(Object.values(database.objectStoreNames), storeNames) == false) {
              version = database.version + 1;
            }
            database.close();
            this.#initiateDatabase(databaseName, storeNames, version);
          };
        } else this.#initiateDatabase(databaseName, storeNames, version);
      });
    }
    /**
     * Equvelent to using `new Database`.
     * 
     * ### Using the `new` constructor:
     * ```js
     * const db = new Database("my_database_name", ["mainStore"]);
     * var mainStore;
     * db.onopen = () => {
     * 	mainStore = db.getStore("mainStore");
     * }
     * const mainStore = db.getStore("mainStore");
     * ```
     * ### Using the `await Database.new()` function:
     * ```js
     * const db = await Database.new("my_database_name", ["mainStore"]);
     * const mainStore = db.getStore("mainStore");
     * ```
     * @param {string} databaseName
     * @param {string[]} storeNames Default table names. `Database.stores` may be different, depending on databases version
     * @param {number|1} version
     * @returns {Promise<TBDatabase>}
     */
    static async asyncOpen(databaseName, storeNames, version) {
      return new Promise((resolve, reject) => {
        let database = new _TBDatabase(databaseName, storeNames, version);
        database.onopen = () => {
          resolve(database);
        };
        database.onerroropen = () => {
          reject();
        };
      });
    }
    /**
     * @param {string} databaseName
     * @param {string[]} storeNames Default table names. `Database.stores` may be different, depending on databases version
     * @param {number|1} version
     */
    #initiateDatabase(databaseName, storeNames, version) {
      this.#version = version;
      let request = indexedDB.open(databaseName, version);
      request.onupgradeneeded = (event) => {
        this.#database = event.target.result;
        let existingStores = Object.values(this.#database.objectStoreNames);
        var storesToBeRemoved = existingStores.filter(function(storeName) {
          return storeNames.indexOf(storeName) == -1;
        });
        for (let i2 = 0; i2 < storesToBeRemoved.length; i2++) {
          let storeToBeRemoved = storesToBeRemoved[i2];
          this.#database.deleteObjectStore(storeToBeRemoved);
        }
        for (let index = 0; index < storeNames.length; index++) {
          let storeName = storeNames[index];
          if (this.#database.objectStoreNames.contains(storeName)) continue;
          let objectStore = this.#database.createObjectStore(storeName, {});
          objectStore.createIndex("key", "key", { unique: true });
        }
      };
      request.onsuccess = (event) => {
        this.#database = event.target.result;
        let existingStoreNames = Object.values(this.#database.objectStoreNames);
        for (let index = 0; index < existingStoreNames.length; index++) {
          let storeName = storeNames[index];
          this.#stores[storeName] = new TBStore(this.#database, storeName);
        }
        this.onopen();
      };
      request.onerror = (event) => {
        this.onerroropen(event);
      };
    }
    /**
     * Get a store with specified name/key from the database
     * @param {string|number} key `type:string` Name of store; `type:number` Store index
     * @returns {TBStore|null}
     */
    getStore(key) {
      if (typeof key == "string") {
        if (key in this.#stores) return this.#stores[key];
        return null;
      } else if (typeof key == "number") {
        let array = Object.values(this.#stores);
        if (key >= 0 || key < array.length) return array[key];
        return null;
      }
    }
    /**
     * Deletes this database and all of its contents
     */
    delete() {
      let name = this.#database.name;
      this.#database.close();
      let request = indexedDB.deleteDatabase(name);
      request.onsuccess = (event) => {
        this.onclose(event);
      };
      request.onerror = (event) => {
        this.onerrorclose(event);
      };
    }
    onopen = () => {
    };
    onclose = () => {
    };
    /** @param {Event} e */
    onerroropen = (e) => {
    };
    /** @param {Event} e */
    onerrorclose = (e) => {
    };
  };
  var TBStore = class {
    /** @type {IDBDatabase} */
    #parentDatabase;
    /** @type {string} */
    #storeName;
    get name() {
      return this.#storeName;
    }
    /**
     * @param {IDBDatabase} parentDatabase
     * @param {string} storeName 
     */
    constructor(parentDatabase, storeName) {
      this.#parentDatabase = parentDatabase;
      this.#storeName = storeName;
    }
    /**
     * Get the item with specified key from the store
     * @param {string} key
     * @returns {Promise<any>}
     */
    get(key) {
      return new Promise((resolve) => {
        let transaction = this.#parentDatabase.transaction([this.#storeName], "readonly");
        let objectStore = transaction.objectStore(this.#storeName);
        let objectStoreRequest = objectStore.get(key);
        objectStoreRequest.onsuccess = (event) => {
          resolve(objectStoreRequest.result);
        };
        objectStoreRequest.onerror = (event) => {
          console.error(event);
          resolve(null);
        };
      });
    }
    /**
     * Get all keys and values as one object
     * @returns {Promise<object>}
     */
    getAll() {
      return new Promise((resolve, reject) => {
        let transaction = this.#parentDatabase.transaction([this.#storeName], "readonly");
        let objectStore = transaction.objectStore(this.#storeName);
        let keyRequest = objectStore.getAllKeys();
        let valueRequest = objectStore.getAll();
        function complete() {
          let keys = keyRequest.result;
          let values = valueRequest.result;
          let object = keys.reduce((obj, key, index) => ({ ...obj, [key]: values[index] }), {});
          resolve(object);
        }
        let bothReady = false;
        function onsuccess() {
          if (bothReady == false) {
            bothReady = true;
            return;
          }
          complete();
        }
        ;
        keyRequest.onsuccess = onsuccess;
        valueRequest.onsuccess = onsuccess;
      });
    }
    /**
     * Get all item keys from the store, detached from their values
     * @returns {Promise<any[]>}
     */
    getAllValues() {
      return new Promise((resolve, reject) => {
        let transaction = this.#parentDatabase.transaction([this.#storeName], "readonly");
        let objectStore = transaction.objectStore(this.#storeName);
        let request = objectStore.getAll();
        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    }
    /**
     * Get all item values from the store, detached from their keys
     * @returns {Promise<string[]>}
     */
    getAllKeys() {
      return new Promise((resolve, reject) => {
        let transaction = this.#parentDatabase.transaction([this.#storeName], "readonly");
        let objectStore = transaction.objectStore(this.#storeName);
        let request = objectStore.getAllKeys();
        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    }
    /**
     * @param {string} key 
     * @param {any} value 
     * @returns {Promise<Event>}
     */
    set(key, value2) {
      return new Promise((resolve, reject) => {
        let transaction = this.#parentDatabase.transaction([this.#storeName], "readwrite");
        let objectStore = transaction.objectStore(this.#storeName);
        let index = objectStore.index("key");
        let request = index.get(key);
        request.onsuccess = (event) => {
          objectStore.put(value2, key);
          resolve(event);
        };
        request.onerror = (event) => {
          reject(event);
        };
      });
    }
    /**
     * Remove an item with a specified key from the store 
     * @param {string} key
     * @returns {Promise<Event>}
     */
    delete(key) {
      return new Promise((resolve, reject) => {
        let transaction = this.#parentDatabase.transaction([this.#storeName], "readwrite");
        let objectStore = transaction.objectStore(this.#storeName);
        let request = objectStore.delete(key);
        request.onsuccess = (event) => {
          objectStore.put(value, key);
          resolve(event);
        };
        request.onerror = reject;
      });
    }
    /**
     * Remove all items from the store
     * @returns {Promise<Event>}
     */
    clear() {
      return new Promise((resolve, reject) => {
        let transaction = this.#parentDatabase.transaction([this.#storeName], "readwrite");
        let objectStore = transaction.objectStore(this.#storeName);
        let request = objectStore.clear();
        request.onsuccess = resolve;
        request.onerror = reject;
      });
    }
  };
  function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();
    for (var i2 = 0; i2 < a.length; ++i2) {
      if (a[i2] !== b[i2]) return false;
    }
    return true;
  }

  // src/extras/Files.js
  var files = {
    /**
     * @param {{ multiple?:boolean, returnAsEvent?:boolean, accept?: string|string[] }} options
     * @returns {Promise<TBFile|TBFile[]>}
     */
    getFromFilePicker(options) {
      return new Promise((resolve, reject) => {
        let fileUploadInput = document.createElement("input");
        fileUploadInput.type = "file";
        if (typeof options?.multiple == "boolean") fileUploadInput.multiple = options.multiple;
        if (typeof options?.accept == "string") fileUploadInput.accept = options.accept;
        else if (Array.isArray(options?.accept)) fileUploadInput.accept = options.accept.join(",");
        fileUploadInput.oninput = (e) => {
          let files2 = fileUploadInput.files;
          let output = [];
          for (let i2 = 0; i2 < files2.length; i2++) {
            let file = fileUploadInput.files[0];
            if (!file) {
              reject(e);
              return;
            }
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = (e2) => {
              if (options?.returnAsEvent) output.push(e2);
              else output.push({ name: file.name, content: e2.target.result });
              if (output.length != files2.length) return;
              if (options?.multiple) resolve(output);
              else resolve(output[0]);
            };
            reader.onerror = reject;
          }
        };
        fileUploadInput.click();
      });
    }
  };

  // src/math/Vector.js
  var radToDeg = 180 / Math.PI;
  var degToRad = Math.PI / 180;
  var Vector = class _Vector {
    #deg = 0;
    #rad = 0;
    #mag = 1;
    #x = 1;
    #y = 0;
    /** @param {number} number */
    set deg(number) {
      this.#deg = number;
      this.#rad = number * degToRad;
      this.#x = this.#mag * Math.cos(this.#rad);
      this.#y = this.#mag * Math.sin(this.#rad);
      this.#defaultMode = "deg";
    }
    get deg() {
      return this.#deg;
    }
    /** @param {number} number */
    set rad(number) {
      this.#deg = number * radToDeg;
      this.#rad = number;
      this.#x = this.#mag * Math.cos(number);
      this.#y = this.#mag * Math.sin(number);
      this.#defaultMode = "rad";
    }
    get rad() {
      return this.#rad;
    }
    /** @param {number} number */
    set mag(number) {
      this.#mag = number;
      this.#x = this.#mag * Math.cos(this.#rad);
      this.#y = this.#mag * Math.sin(this.#rad);
    }
    get mag() {
      return this.#mag;
    }
    /** @param {number} number */
    set x(number) {
      this.#x = number;
      this.#mag = Math.hypot(number, this.#y);
      this.#rad = Math.atan2(this.#y, number);
      this.#deg = this.#rad * radToDeg;
      this.#defaultMode = "xy";
    }
    get x() {
      return this.#x;
    }
    /** @param {number} number */
    set y(number) {
      this.#y = number;
      this.#mag = Math.hypot(this.#x, number);
      this.#rad = Math.atan2(number, this.#x);
      this.#deg = this.#rad * radToDeg;
      this.#defaultMode = "xy";
    }
    get y() {
      return this.#y;
    }
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
        throw new Error('Unknown Vector constructor mode of: "' + mode + '"');
      }
      this.#defaultMode = mode;
    }
    /** @param {...Vector} vectors */
    add(...vectors) {
      let newVector = _Vector.sumOf(this, ...vectors);
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
      return new _Vector("xy", x, y);
    }
    /** @param {number} deg */
    static fromDeg(deg) {
      return new _Vector("deg", 1, deg);
    }
    /** @param {number} rad */
    static fromRad(rad) {
      return new _Vector("rad", 1, rad);
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
      return new _Vector("xy", sum.x, sum.y);
    }
    /**
     * Returns the dot product between two vectors
     * @param {Vector} vector1
     * @param {Vector} vector2
     * @returns {Vector}
     */
    static dotProduct(vector1, vector2) {
      return new _Vector("xy", vector1.x * vector2.x, vector1.y * vector2.y);
    }
    /**
     * Returns the cross-product between two vectors
     * @param {Vector} vector1 
     * @param {Vector} vector2 
     * @returns {number}
     */
    static crossProduct(vector1, vector2) {
      return vector1.x * vector2.y - vector1.y * vector2.x;
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
  };

  // src/inputs/Keyboard.js
  var Keyboard_default = new class TBKeyboard {
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
        if (this.debug) console.log("key:" + key + " DOWN", this.#keys);
      });
      window.addEventListener("keyup", (e) => {
        let key = e.key.toLowerCase();
        let index = this.#keys.indexOf(key);
        if (index == -1) return;
        this.#triggerEvents("up", e);
        this.#keys.splice(index, 1);
        if (this.debug) console.log("key:" + key + " UP", this.#keys);
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
      let indexesToBeRemoved = [];
      for (let eventListener of this.#events) {
        if (eventListener.kind != kind) continue;
        if (arraysEqual2(this.#keys, eventListener.keys) == false) continue;
        if (eventListener.passive) e.preventDefault();
        eventListener.callback(e);
        if (eventListener.options.once) indexesToBeRemoved.push(i);
      }
      if (indexesToBeRemoved.length == 0) return;
      for (let i2 = 0; i2 < indexesToBeRemoved.length; i2++) {
        this.#events.splice(indexesToBeRemoved[i2], 1);
      }
    }
  }();
  function arraysEqual2(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();
    for (var i2 = 0; i2 < a.length; ++i2) {
      if (a[i2] !== b[i2]) return false;
    }
    return true;
  }

  // src/inputs/Mouse.js
  function getMouseButtonsFromEvent(event) {
    let mouseButtonNames = ["left", "right", "wheel", "back", "forward", "eraser"];
    let object = {};
    for (const buttonName of mouseButtonNames) {
      let isPressed = Boolean(event.buttons & 1 << mouseButtonNames.indexOf(buttonName));
      object[buttonName] = isPressed;
    }
    return object;
  }
  var Mouse_default = new class TBMouse {
    #position = { x: 0, y: 0 };
    get position() {
      return this.#position;
    }
    /** Alias to: `mouse.position.x` */
    get x() {
      return this.#position.x;
    }
    /** Alias to: `mouse.position.y` */
    get y() {
      return this.#position.y;
    }
    #buttons = {
      left: false,
      right: false,
      wheel: false,
      back: false,
      forward: false
    };
    get buttons() {
      return this.#buttons;
    }
    /** Alias to: `Mouse.buttons.left` */
    get click_l() {
      return this.#buttons.left;
    }
    /** Alias to: `Mouse.buttons.right` */
    get click_r() {
      return this.#buttons.right;
    }
    preventContextMenu = false;
    preventScroll = true;
    #pen = {
      pressure: 0
    };
    get pen() {
      return this.#pen;
    }
    /** @type {"mouse"|"pen"|"touch"} */
    #pointerType = "mouse";
    get pointerType() {
      return this.#pointerType;
    }
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
      });
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
      if (typeof options?.updateFunc != "function") options.updateFunc = new Function();
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
      for (let i2 = 0; i2 < this.#hooks.length; i2++) {
        let hook = this.#hooks[i2];
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
      let trigger_onMove = e.clientX != this.x || e.clientY != this.y;
      let trigger_onLClick = buttons.left && !this.#buttons.left;
      let trigger_onRClick = buttons.right && !this.#buttons.right;
      let trigger_onWClick = buttons.wheel && !this.#buttons.wheel;
      let trigger_offLClick = false;
      let trigger_offRClick = false;
      let trigger_offWClick = false;
      if (!buttons.left && this.#buttons.left) trigger_offLClick = true;
      if (!buttons.right && this.#buttons.right) trigger_offRClick = true;
      if (!buttons.wheel && this.#buttons.wheel) trigger_offWClick = true;
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
    get events() {
      return this.#events;
    }
    /**
     * 
     * @param {"move" | "click" | "lclick" | "rclick"} eventType
     * @param {(e:MouseEvent, mouse:TBMouse, mouseEvent: TBMouseEvent)=>{}} callback
     * @returns {TBMouseEvent} A **copy** of the created event. Used for `mouse.removeEventListener(event)`
     */
    on(eventType, callback) {
      let id2 = Math.floor().toString(16);
      let mouseEvent = { mode: "on", id: id2, type: eventType, callback };
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
      let id2 = Math.floor().toString(16);
      let mouseEvent = { mode: "off", id: id2, type: eventType, callback };
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
        let mouseEvent = this.#events.find((mouseEvent2) => {
          return mouseEvent2.id = id;
        });
        let index = this.#events.indexOf(mouseEvent);
        this.#events.splice(index, 1);
      } else throw new Error("Cannot remove event-listener if the identifier is not of type `TBMouseEvent` or `string`.");
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
  }();
  var MouseHook = class {
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
  };

  // src/extras/CustomMenu.js
  var import_meta = {};
  var customMenuExistsInDOM = false;
  var CustomMenu = class _CustomMenu extends HTMLElement {
    static logInfo() {
      console.group("How to use the <custom-menu> element");
      console.log('- The "kind" attribute can have the value of "toolbar" or "sidebar"');
      console.groupEnd();
    }
    /** @param {"light"|"dark"} theme If the theme is not `"light" | "dark"`, the theme will be set the CSS `@media (preferes-color-sheme)`*/
    static set theme(theme) {
      if (theme != "light" && theme != "dark") {
        theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (theme) theme = "dark";
        else theme = "light";
      }
      document.documentElement.setAttribute("custom-menu-theme", theme);
    }
    static get theme() {
      let theme = document.documentElement.getAttribute("custom-menu-theme");
      if (theme != "light" && theme != "dark") {
        theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (theme) theme = "dark";
        else theme = "light";
        document.documentElement.setAttribute("custom-menu-theme", theme);
      }
      return theme;
    }
    constructor() {
      super();
    }
    connectedCallback() {
      if (!customMenuExistsInDOM) {
        this.style.display = "none";
        let cssLink = document.createElement("link");
        cssLink.onload = () => {
          this.style.display = null;
        };
        cssLink.rel = "stylesheet";
        cssLink.href = new URL("./custom-menu.css", import_meta.url);
        document.head.appendChild(document.createComment("Inserted by toolbelt-v2/CustomMenu.js"));
        document.head.appendChild(cssLink);
        customMenuExistsInDOM = true;
      }
      let kind = this.getAttribute("kind");
      if (kind == "toolbar") {
        this.#toolbar();
      } else if (kind == "dropdown") {
        this.#dropdown();
      }
    }
    #toolbar() {
      let self = this;
      let startX = 0;
      let startY = 0;
      let padding = parseFloat(self.getAttribute("drag-clamp")) ?? parseFloat(getComputedStyle(document.documentElement).fontSize);
      this.style.top = padding + "px";
      this.style.left = padding + "px";
      this.addEventListener("touchstart", dragMouseDown, { passive: true });
      this.addEventListener("mousedown", dragMouseDown);
      window.addEventListener("blur", closeDragElement);
      function dragMouseDown(e) {
        if (this.hasAttribute("draggable") == false) return;
        e.preventDefault();
        startX = (e.clientX ?? e.touches[0].clientX) - self.offsetLeft;
        startY = (e.clientY ?? e.touches[0].clientY) - self.offsetTop;
        if (self.getAttribute("direction") == "row" || !self.hasAttribute("direction")) {
          let paddingLeft = parseFloat(getComputedStyle(self).getPropertyValue("padding-left"));
          let thumbWidth = parseFloat(getComputedStyle(self, ":before").getPropertyValue("width"));
          if (startX > thumbWidth + paddingLeft) return;
        } else {
          let paddingTop = parseFloat(getComputedStyle(self).getPropertyValue("padding-top"));
          let thumbHeight = parseFloat(getComputedStyle(self, ":before").getPropertyValue("height"));
          if (startY > thumbHeight + paddingTop) return;
        }
        document.addEventListener("touchend", closeDragElement);
        document.addEventListener("touchmove", elementDrag);
        document.addEventListener("mouseup", closeDragElement);
        document.addEventListener("mousemove", elementDrag);
      }
      function elementDrag(e) {
        let x = (e.clientX ?? e.touches[0].clientX) - startX;
        let y = (e.clientY ?? e.touches[0].clientY) - startY;
        let padding2 = parseFloat(self.getAttribute("drag-clamp")) ?? parseFloat(getComputedStyle(document.documentElement).fontSize);
        x = Math.max(padding2, x);
        x = Math.min(window.innerWidth - self.offsetWidth - padding2, x);
        y = Math.max(padding2, y);
        y = Math.min(window.innerHeight - self.offsetHeight - padding2, y);
        self.style.top = y + "px";
        self.style.left = x + "px";
        document.documentElement.setAttribute("custom-menu-dragging", "");
      }
      function closeDragElement() {
        document.removeEventListener("touchend", closeDragElement);
        document.removeEventListener("touchmove", elementDrag);
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag);
        if (self.hasAttribute("drag-snapping-grid")) snap();
        document.documentElement.removeAttribute("custom-menu-dragging");
      }
      function snap() {
        let snappingGridSize = [-1, -1];
        if (self.getAttribute("drag-snapping-grid").includes("x")) snappingGridSize = self.getAttribute("drag-snapping-grid").split("x");
        if (self.getAttribute("drag-snapping-grid").includes(",")) snappingGridSize = self.getAttribute("drag-snapping-grid").split(",");
        if (self.getAttribute("drag-snapping-grid").includes(" ")) snappingGridSize = self.getAttribute("drag-snapping-grid").split(" ");
        let snappingGridSizeX = snappingGridSize[0];
        let snappingGridSizeY = snappingGridSize[1] ?? snappingGridSize[0];
        snappingGridSizeX -= 1;
        snappingGridSizeY -= 1;
        let xPercentage = (self.offsetLeft + self.offsetWidth / 2) / window.innerWidth;
        let xRoundedPercentage = Math.round(xPercentage * snappingGridSizeX) / snappingGridSizeX;
        let x = window.innerWidth * xRoundedPercentage;
        let yPercentage = (self.offsetTop + self.offsetHeight / 2) / window.innerHeight;
        let yRoundedPercentage = Math.round(yPercentage * snappingGridSizeY) / snappingGridSizeY;
        let y = window.innerHeight * yRoundedPercentage;
        let padding2 = parseFloat(self.getAttribute("drag-clamp")) ?? parseFloat(getComputedStyle(document.documentElement).fontSize);
        x -= self.offsetWidth / 2;
        x = Math.max(padding2, x);
        x = Math.min(window.innerWidth - self.offsetWidth - padding2, x);
        y -= self.offsetHeight / 2;
        y = Math.max(padding2, y);
        y = Math.min(window.innerHeight - self.offsetHeight - padding2, y);
        let distance = Math.hypot(self.offsetLeft - x, self.offsetTop - y);
        let duration = 1e3 / distance;
        self.style.transition = `top 300ms ${_CustomMenu.toolbarSnapEasing}, left 300ms ${_CustomMenu.toolbarSnapEasing}`;
        self.style.top = y + "px";
        self.style.left = x + "px";
        setTimeout(() => {
          self.style.transition = "";
        }, 300);
      }
      window.addEventListener("resize", () => {
        let x = parseInt(self.style.left);
        let y = parseInt(self.style.top);
        x = Math.max(padding, x);
        x = Math.min(window.innerWidth - self.offsetWidth - padding, x);
        y = Math.max(padding, y);
        y = Math.min(window.innerHeight - self.offsetHeight - padding, y);
        self.style.top = y + "px";
        self.style.left = x + "px";
        if (self.hasAttribute("drag-snapping-grid")) {
          self.style.transition = "";
          snap();
        }
      });
    }
    #dropdown() {
      let options = Array.from(this.getElementsByTagName("option"));
      let unselectedDiv = document.createElement("div");
      let selected = document.createElement("option");
      if (this.querySelector("option[selected]") || this.hasAttribute("value")) {
        let selectedElement = this.querySelector("option[selected]") || this.hasAttribute("value");
        selected.innerText = selectedElement.innerText;
        this.setAttribute("value", selectedElement.getAttribute("value"));
      } else {
        selected = document.createElement("option");
        selected.innerText = "Select Option";
        this.removeAttribute("value");
      }
      unselectedDiv.append(...options);
      this.innerHTML = "";
      this.appendChild(selected);
      this.appendChild(unselectedDiv);
      selected.addEventListener("click", (e) => {
        this.classList.toggle("open");
        if (this.classList.length == 0) this.removeAttribute("class");
      });
      for (let option of options) {
        option.addEventListener("click", () => {
          this.setAttribute("value", option.getAttribute("value"));
          selected.innerText = option.innerText;
          this.classList.remove("open");
          if (this.classList.length == 0) this.removeAttribute("class");
          options.forEach((o) => {
            o.removeAttribute("selected");
          });
          option.setAttribute("selected", "");
        });
      }
    }
    /**
     * Generated using [Easing Wizard - CSS Easing Editor and Generator](https://easingwizard.com/)
     */
    static toolbarSnapEasing = "linear(0, 0.013 0.6%, 0.05 1.2%, 0.2 2.5%, 0.949 6.7%, 1.2 8.4%, 1.286 9.2%, 1.35 10%, 1.392 10.8%, 1.411 11.6%, 1.411 12.2%, 1.401 12.8%, 1.343 14.2%, 1.258 15.5%, 1.016 18.7%, 0.914 20.4%, 0.856 21.9%, 0.831 23.5%, 0.834 24.7%, 0.858 26.1%, 0.996 30.7%, 1.037 32.4%, 1.06 33.9%, 1.07 35.4%, 1.061 37.7%, 0.989 43.8%, 0.971 47.2%, 1.012 59.1%, 0.995 70.8%, 1)";
  };
  customElements.define("custom-menu", CustomMenu);

  // src/math/Units.js
  var TBUnitConverter = class {
    /**
     * @type {{unit: string, callback: (value: number) => number}[]}
     */
    units = [];
    /**
     * @param {string} unit
     * @param {(value: number) => number} callback
     */
    defineUnit(unit, callback) {
      this.units.push({ unit, callback });
    }
    /**
     * @param {number | string} value
     * @returns {number}
     */
    getValue(value2, ...params) {
      if (typeof value2 != "string") return value2;
      let sections = value2.split(/([0-9\.-]+[a-zA-Z]*)/g).filter((a) => !!a);
      let output = "";
      for (let i2 = 0; i2 < sections.length; i2++) {
        sections[i2] = sections[i2].replaceAll(" ", "");
        let section = sections[i2];
        let unit = this.units.find((unit2) => {
          return unit2.unit == section.replace(/[^a-zA-Z]/g, "");
        });
        if (unit) {
          let number = parseFloat(section);
          section = unit.callback(number, ...params);
        }
        output += `${section}`;
      }
      return this.#parse(output);
    }
    #parse(string) {
      return Function(`	'use strict';
	return (${string});`)();
    }
  };
  var Units_default = new TBUnitConverter();
  var unitConverter = new TBUnitConverter();
  var getValue = function(value2, ...params) {
    return unitConverter.getValue(value2, ...params);
  };

  // src/extras/Image.js
  var assetDIV = document.createElement("div");
  assetDIV.setAttribute("id", "assets");
  assetDIV.setAttribute("style", "display:none;");
  document.body.appendChild(assetDIV);
  var cachedImages = {};
  var errorImage = document.createElement("img");
  errorImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV/TSqVUHewg4pChOlkQLeIoVSyChdJWaNXB5NIvaGJIUlwcBdeCgx+LVQcXZ10dXAVB8APE1cVJ0UVK/F9SaBHjwXE/3t173L0DhGaNqWZgAlA1y8gkE2K+sCIGXxFCAP2Iwy8xU09lF3LwHF/38PH1LsazvM/9OfqUoskAn0g8y3TDIl4nnt60dM77xBFWkRTic+Jxgy5I/Mh12eU3zmWHBZ4ZMXKZOeIIsVjuYrmLWcVQiePEUUXVKF/Iu6xw3uKs1uqsfU/+wnBRW85yneYIklhECmmIkFFHFTVYiNGqkWIiQ/sJD/+w40+TSyZXFYwc89iACsnxg//B727N0tSkmxROAD0vtv0xCgR3gVbDtr+Pbbt1AvifgSut499oAjOfpDc6WvQIGNgGLq47mrwHXO4AQ0+6ZEiO5KcplErA+xl9UwEYvAVCq25v7X2cPgA56mrpBjg4BMbKlL3m8e7e7t7+PdPu7wdhVHKgRoo0GwAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+cKBA8WIsDjvWIAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAJklEQVQoz2P8z/CfARtgZGDEKs7EQCIY1UAMYMQlgSt+RoOVJhoAKAMEHdElw9AAAAAASUVORK5CYII=";
  assetDIV.appendChild(errorImage);
  var image = new class TBImage {
    loadAssets() {
      if (document.querySelectorAll("div#assets").length == 0) {
        let assetDIV2 = document.createElement("div");
        assetDIV2.setAttribute("id", "assets");
        assetDIV2.setAttribute("style", "display:none;");
        document.body.appendChild(assetDIV2);
        return assetDIV2;
      }
      return document.querySelector("div#assets");
    }
    /**
     * @param {string} imgSource 
     * @returns {Promise<HTMLImageElement>}
     */
    cacheImage(imgSource) {
      return new Promise((resolve, reject) => {
        if (imgSource == "") imgSource = errorImage.src;
        else if (imgSource.endsWith("/")) imgSource = errorImage.src;
        let loadedImage = document.querySelector(`div#assets>img[src="${imgSource}"]`);
        if (loadedImage) {
          resolve(loadedImage);
          return;
        }
        let newlyLoadedImage = document.createElement("img");
        newlyLoadedImage.onload = () => {
          resolve(newlyLoadedImage);
        };
        newlyLoadedImage.src = imgSource;
        assetDIV.appendChild(newlyLoadedImage);
      });
    }
    /**
     * 
     * @param {string|HTMLImageElement|HTMLCanvasElement} imgSource
     * 
     * @param {{ x:number, y:number, w:number, h:number }} destination
     * 
     * @param {?{ x:null, y:number, w:number, h:number }} crop
     * 
     * @param { { pixelated: boolean, alpha: number } } filters
     * @param {HTMLCanvasElement} canvas
     * @param {boolean|true} saveAsset Defaults to `true`
     */
    drawImage(imgSource, destination, crop, filters, canvas, saveAsset = true) {
      let context = canvas.getContext("2d");
      context.globalAlpha = 1;
      context.globalAlpha = filters.alpha ?? 1;
      if (filters.pixelated ?? false) {
        context.msImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        destination.x = Math.floor(destination.x);
        destination.y = Math.floor(destination.y);
        destination.w = Math.floor(destination.w);
        destination.h = Math.floor(destination.h);
      }
      context.save();
      if (destination.w < 0) {
        destination.w *= -1;
        context.scale(-1, 1);
        context.translate(
          0 - canvas.width,
          0
        );
        destination.x = canvas.width - destination.x;
      }
      if (crop) {
        if (crop.x == -1) crop.x = 0;
        if (crop.y == -1) crop.y = 0;
        if (crop.w == -1) crop.w = void 0;
        if (crop.h == -1) crop.h = void 0;
      }
      try {
        let source = imgSource;
        if (saveAsset && imgSource instanceof HTMLCanvasElement == false) {
          source = this.#retrieveImage(imgSource);
        }
        if (crop.w && crop.h) {
          context.drawImage(
            source,
            crop.x || 0,
            crop.y || 0,
            crop.w,
            crop.h,
            destination.x,
            destination.y,
            destination.w,
            destination.h
          );
        } else {
          context.drawImage(
            source,
            destination.x,
            destination.y,
            destination.w,
            destination.h
          );
        }
      } catch {
        context.drawImage(
          errorImage,
          0,
          0,
          16,
          16,
          Math.floor(destination.x),
          Math.floor(destination.y),
          Math.floor(destination.w),
          Math.floor(destination.h)
        );
      }
      context.restore();
      context.globalAlpha = 1;
    }
    #retrieveImage(imgSource) {
      if (imgSource == "") imgSource = errorImage.src;
      else if (imgSource.endsWith("/")) imgSource = errorImage.src;
      if (imgSource in cachedImages) {
        return cachedImages[imgSource].image;
      }
      let newImage = new Image();
      newImage.src = imgSource;
      cachedImages[imgSource] = { loaded: false, image: newImage };
      newImage.onload = () => {
        cachedImages[imgSource].loaded = true;
      };
      return newImage;
    }
  }();

  // src/math/Points.js
  var Point2 = class _Point2 {
    x = 0;
    y = 0;
    constructor(x = this.x, y = this.y) {
      this.x = x;
      this.y = y;
    }
    set(x = this.x, y = this.y) {
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
    scale(x = 1, y = 1) {
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
    equals(x = 0, y = 0) {
      if (x instanceof _Point2) {
        y = x.x;
        x = x.x;
      }
      return this.x == x && this.y == y;
    }
    toObject() {
      return {
        x: this.x,
        y: this.y
      };
    }
    clone() {
      return new _Point2(this.x, this.y);
    }
    /** @param {Point2} point */
    distanceTo(point) {
      return _Point2.distanceBetween(this, point);
    }
    /** @param {Point2} point */
    angleTo(point) {
      return _Point2.angleBetween(this, point);
    }
    /**
     * @param {Point2|{x:number,y:number}} p1
     * @param {Point2|{x:number,y:number}} p2
     * @returns {number}
     */
    static distanceBetween(p1, p2) {
      return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }
    /**
     * @param {Point2|{x:number,y:number}} start
     * @param {Point2|{x:number,y:number}} end
     * @returns {number}
     */
    static angleBetween(start, end) {
      return Math.atan2(end.x - start.x, end.y - start.y);
    }
    /** Reference to: `Point2.distanceBetween(p1, p2)`*/
    static distance = _Point2.distanceBetween;
    /** Reference to: `Point2.angleBetween(start, end)`*/
    static angle = _Point2.angleBetween;
  };
  var Point3 = class _Point3 extends Point2 {
    x = 0;
    y = 0;
    z = 0;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    translate(x = 0, y = 0, z = 0) {
      this.x += x;
      this.y += y;
      this.z += z;
    }
    scale(x = 1, y = 1, z = 1) {
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
    equals(x = 0, y = 0, z = 0) {
      if (x instanceof _Point3) {
        y = x.x;
        z = x.z;
        x = x.x;
      }
      return this.x == x && this.y == y && this.z == z;
    }
    toObject() {
      return {
        x: this.x,
        y: this.y,
        z: this.z
      };
    }
  };
  var Point4 = class _Point4 {
    x = 0;
    y = 0;
    w = 0;
    h = 0;
    constructor(x = 0, y = 0, w = 0, h = 0) {
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
      if (x instanceof _Point4 || x?.w && x?.h) {
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
    translate(x = 0, y = 0, w = 0, h = 0) {
      this.x += x;
      this.y += y;
      this.w += w;
      this.h += h;
    }
    scale(x = 1, y = 1, w = 1, h = 1) {
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
    contains(x = 0, y = 0) {
      if (typeof x == "object" && x.x && x.y) {
        y = x.y;
        x = x.x;
      }
      return range.fits(this.x, x, this.x + this.w) && range.fits(this.y, y, this.y + this.h);
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
      let intersecting = r1IntersectingX && r1IntersectingY || r2IntersectingX && r2IntersectingY || r1IntersectingX && r2IntersectingY || r1IntersectingY && r2IntersectingX;
      return intersecting;
    }
    clone() {
      return new _Point4(this.x, this.y, this.w, this.h);
    }
    toObject() {
      return {
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h
      };
    }
  };

  // index.js
  window.toolbelt = {
    keyboard: Keyboard_default,
    mouse: Mouse_default,
    Controller,
    Database: TBDatabase,
    Colour,
    Color: Colour,
    CustomUnitConverter: Units_default,
    getValue,
    unitConverter,
    range,
    round,
    Vector,
    files,
    CustomMenu,
    image,
    Point2,
    Point3,
    Point4
  };
})();
