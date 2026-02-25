
/** A wrapper for the `IndexedDB` APIs */
export default class TBDatabase {
	/** @type {IDBDatabase} */
	#database;

	/** @type {Object<string, TBStore>} */
	#stores = {};

	#version = 1;
	get version() { return this.#version; }

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
		if(version <= 0) version = 1;
		if (typeof storeNames == "string") storeNames = [storeNames];

		indexedDB.databases().then((databaseList) => {
			let thisDatabase = databaseList.find(db => db.name == databaseName);
			if (thisDatabase) {
				let request = indexedDB.open(databaseName, thisDatabase.version);

				request.onsuccess = (event) => {
					/** @type {IDBDatabase} */
					let database = event.target.result;

					// If there is a change in store-names, make the version higher than the latest
					if (arraysEqual(Object.values(database.objectStoreNames), storeNames) == false) {
						version = database.version + 1;
					}

					database.close();
					this.#initiateDatabase(databaseName, storeNames, version);
				}
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
			let database = new TBDatabase(databaseName, storeNames, version);

			database.onopen = () => {
				resolve(database);
			}
			database.onerroropen = () => {
				reject();
			}
		})
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

			var storesToBeRemoved = existingStores.filter(function(storeName){
				return storeNames.indexOf(storeName)==-1;
			});

			for (let i = 0; i < storesToBeRemoved.length; i ++) {
				let storeToBeRemoved = storesToBeRemoved[i];
				this.#database.deleteObjectStore(storeToBeRemoved);
			}
			  

			for (let index = 0; index < storeNames.length; index++) {
				let storeName = storeNames[index];

				if (this.#database.objectStoreNames.contains(storeName)) continue; // Store already exists

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
		request.onerror = (event) => { this.onerroropen(event); };
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
		}else if (typeof key == "number") {
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

	onopen = () => {};
	onclose = () => {};

	/** @param {Event} e */
	onerroropen = (e) => {};
	/** @param {Event} e */
	onerrorclose = (e) => {};
}

class TBStore {
	/** @type {IDBDatabase} */
	#parentDatabase;

	/** @type {string} */
	#storeName;
	get name() { return this.#storeName; }

	/**
	 * @param {IDBDatabase} parentDatabase
	 * @param {string} storeName 
	 */
	constructor(parentDatabase, storeName){
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
			}
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
			};
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
	set(key, value) {
		return new Promise((resolve, reject) => {
			let transaction = this.#parentDatabase.transaction([this.#storeName], "readwrite");
			let objectStore = transaction.objectStore(this.#storeName);

			let index = objectStore.index("key");
			let request = index.get(key);

			request.onsuccess = (event) => {
				objectStore.put(value, key);
				resolve(event);
			};

			request.onerror = (event) => {
				reject(event);
			}
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
		})
	}
}

/**
 * @param {array} a 
 * @param {array} b 
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