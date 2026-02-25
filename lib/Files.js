export const files = {

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
				let files = fileUploadInput.files;
				let output = [];
				for (let i = 0; i < files.length; i ++) {
					let file = fileUploadInput.files[0];
					if (!file) { reject(e); return; }
					var reader = new FileReader();
					reader.readAsText(file, "UTF-8");
					reader.onload = (e) => {
						if (options?.returnAsEvent) output.push(e);
						else output.push({name: file.name, content: e.target.result });

						if (output.length != files.length) return;

						if (options?.multiple) resolve(output);
						else resolve(output[0]);
					}
					reader.onerror = reject;
				}

			}

			fileUploadInput.click();
		});
	}
}