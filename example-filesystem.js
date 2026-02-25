import { Database, files } from "./index.js";

const db = await Database.asyncOpen("database", ["filesystem"]);
const filesystem = db.getStore("filesystem");

const template = document.getElementById("file-template"); template.remove();
const currentPathEl = document.getElementById("current-path"); currentPathEl.removeAttribute("id");
const fileElementParent = document.getElementById("files");

/** @param {string} filePath @param {any} fileData */
function createFile(filePath, fileData) {
	if (filePath.startsWith("/") == false) filePath = "/"+filePath;

	return new Promise((resolve, reject) => {

		filesystem.getAllValues()
		.then((values) => {
			if (values.find((v) => v.path == filePath)) {
				reject("File already exists.");
				return -1;
			}
			return 1;
		})
		.then((success) => {
			if (success == -1) return;
			let id = crypto.randomUUID();
			filesystem.set(id, {
				path: filePath,
				contents: fileData
			}).then(resolve).catch(reject)
		})

	});
}

window.createFile = createFile;

var isLoading = false;

/** @param {string} path */
async function showFolder(path) {

	if (isLoading == true) return;
	isLoading = true;

	currentPathEl.innerText = "Root/";

	let pathParts = path.split("/");
	for (let part of pathParts) {
		if (!part) continue;
		let span = document.createElement("span");
		span.innerText = part;
		currentPathEl.appendChild(span);
		currentPathEl.innerText += "/";
	}
	
	let loadedAbsolutePaths = [];
	
	let items = await filesystem.getAllValues();
	items = items.sort((a, b) => a.path.localeCompare(b.path));
	
	let oldElements = document.querySelectorAll("#files .item, #folders .item");
	oldElements.forEach(oldElement => oldElement.remove() );

	for (let item of items) {
		if (item.path.startsWith(path) == false) continue;

		let displayPath = item.path.replace(path, "/").match(/^\/([^\/]+\/?)/)[0];
		let absolutePath = (path+displayPath+"/").replaceAll("//", "/");

		if (loadedAbsolutePaths.find(p => (p == absolutePath))) continue;
		
		let clone = template.content.cloneNode(true);
		let base = clone.getElementById("base"); base.removeAttribute("id");
		let name = clone.getElementById("name"); name.removeAttribute("id");
		
		name.innerText = displayPath.replaceAll("/", "");
		if (item.path.replace(path).includes("/")) {
			base.style.cursor = "pointer";
			base.ondblclick = () => {
				let url = new URL(window.location.href);
				url.searchParams.set("p", btoa(absolutePath));
				window.history.pushState({}, "", url.href);
				showFolder(absolutePath);
			};
			clone.getElementById("icon-folder").removeAttribute("id");
			clone.getElementById("icon-file").remove();
		} else {
			clone.getElementById("icon-folder").remove();
			clone.getElementById("icon-file").removeAttribute("id");
			base.setAttribute("disabled", "");
		}
		
		base.onkeyup = (e) => { if (e.key == "Enter") base.ondblclick() };
		
		fileElementParent.appendChild(clone);
		loadedAbsolutePaths.push(absolutePath);
	}

	isLoading = false;
}

window.addEventListener("popstate", (e) => {
	let params = new URLSearchParams(window.location.search);
	let path = params.has("p") ? atob(params.get("p")) : "/";
	showFolder(path);
});

window.dispatchEvent(new Event("popstate"));



async function exportFilesystem() {
	let object = await filesystem.getAll();
	let string = JSON.stringify(object);
	let incrypted = btoa(string);

	let fileName = `exported_filesystem-${Date.now()}.indexeddb`;
	let myFile = new Blob([incrypted], {type: 'text/plain'});

	window.URL = window.URL || window.webkitURL;
	let link = document.createElement("a");

	link.setAttribute("href", window.URL.createObjectURL(myFile));
	link.setAttribute("download", fileName);

	link.click();
}

async function importFilesystem() {
	let incrypted = await files.getFromFilePicker({ accept: ".indexeddb" });
	let string = atob(incrypted.content);
	let object = JSON.parse(string);

	void await filesystem.clear();

	for (let key in object) {
		let value = object[key];
		void await filesystem.set(key, value);
	}

	let url = new URL(window.location.href);
	url.searchParams.delete("p");
	window.history.replaceState({}, "", url.href);
	window.dispatchEvent(new Event("popstate"));
}

window.exportFilesystem = exportFilesystem;
window.importFilesystem = importFilesystem;