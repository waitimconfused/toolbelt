const assetDIV = document.createElement("div");
assetDIV.setAttribute("id", "assets");
assetDIV.setAttribute("style", "display:none;");
document.body.appendChild(assetDIV);

/**
 * @type {Object<string, { loaded: boolean, image: HTMLImageElement }>}
 */
const cachedImages = {};

const errorImage = document.createElement("img");
errorImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV/TSqVUHewg4pChOlkQLeIoVSyChdJWaNXB5NIvaGJIUlwcBdeCgx+LVQcXZ10dXAVB8APE1cVJ0UVK/F9SaBHjwXE/3t173L0DhGaNqWZgAlA1y8gkE2K+sCIGXxFCAP2Iwy8xU09lF3LwHF/38PH1LsazvM/9OfqUoskAn0g8y3TDIl4nnt60dM77xBFWkRTic+Jxgy5I/Mh12eU3zmWHBZ4ZMXKZOeIIsVjuYrmLWcVQiePEUUXVKF/Iu6xw3uKs1uqsfU/+wnBRW85yneYIklhECmmIkFFHFTVYiNGqkWIiQ/sJD/+w40+TSyZXFYwc89iACsnxg//B727N0tSkmxROAD0vtv0xCgR3gVbDtr+Pbbt1AvifgSut499oAjOfpDc6WvQIGNgGLq47mrwHXO4AQ0+6ZEiO5KcplErA+xl9UwEYvAVCq25v7X2cPgA56mrpBjg4BMbKlL3m8e7e7t7+PdPu7wdhVHKgRoo0GwAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+cKBA8WIsDjvWIAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAJklEQVQoz2P8z/CfARtgZGDEKs7EQCIY1UAMYMQlgSt+RoOVJhoAKAMEHdElw9AAAAAASUVORK5CYII=";
assetDIV.appendChild(errorImage);

export const image = new class TBImage {

	loadAssets(){
		if(document.querySelectorAll("div#assets").length == 0){
			let assetDIV = document.createElement("div");
			assetDIV.setAttribute("id", "assets");
			assetDIV.setAttribute("style", "display:none;");
			document.body.appendChild(assetDIV);
			return(assetDIV);
		}
		return document.querySelector("div#assets");
	}

	/**
	 * @param {string} imgSource 
	 * @returns {Promise<HTMLImageElement>}
	 */
	cacheImage(imgSource){
		return new Promise((resolve, reject) => {
			if (imgSource == "") imgSource = errorImage.src;
			else if (imgSource.endsWith("/")) imgSource = errorImage.src;
	
			let loadedImage = document.querySelector(`div#assets>img[src="${imgSource}"]`);
			if(loadedImage) {
				resolve(loadedImage);
				return;
			}
	
			let newlyLoadedImage = document.createElement("img");
			newlyLoadedImage.onload = () => {
				resolve(newlyLoadedImage);
			}
			newlyLoadedImage.src = imgSource;
			assetDIV.appendChild(newlyLoadedImage);
		})
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
	drawImage(
		imgSource,
		destination,
		crop,
		filters, canvas, saveAsset=true
	){

		let context = canvas.getContext("2d");
		context.globalAlpha = 1;
		context.globalAlpha = filters.alpha ?? 1;

		if(filters.pixelated ?? false){
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
		if(destination.w < 0){
			destination.w *= -1;
			context.scale(-1, 1);
			context.translate(
				0 - canvas.width,
				0
			);
			destination.x = canvas.width - destination.x;
		}

		if (crop) {
			if(crop.x == -1) crop.x = 0;
			if(crop.y == -1) crop.y = 0;
		
			if(crop.w == -1) crop.w = undefined;
			if(crop.h == -1) crop.h = undefined;
		}

		try {
			let source = imgSource;
			if (saveAsset && imgSource instanceof HTMLCanvasElement == false) {
				source = this.#retrieveImage(imgSource);
			}
			if(crop.w && crop.h){
				context.drawImage(
					source,
		
					crop.x || 0, crop.y || 0,
					crop.w, crop.h,
		
					destination.x, destination.y,
					destination.w, destination.h,
				);
			}else{
				context.drawImage(
					source,
		
					destination.x, destination.y,
					destination.w, destination.h,
				);
			}
		}catch {
			context.drawImage(
				errorImage,

				0, 0, 16, 16,

				Math.floor(destination.x), Math.floor(destination.y),
				Math.floor(destination.w), Math.floor(destination.h),
			);
		}
		context.restore();
		context.globalAlpha = 1;
	}

	#retrieveImage(imgSource) {
		if (imgSource == "") imgSource = errorImage.src;
		else if (imgSource.endsWith("/")) imgSource = errorImage.src;
	
		if ( imgSource in cachedImages ) {
			return cachedImages[imgSource].image;
		}
	
		let newImage = new Image;
		newImage.src = imgSource;
		cachedImages[imgSource] = {loaded: false, image: newImage};
	
		newImage.onload = () => {
			cachedImages[imgSource].loaded = true;
		}
	
		return newImage;
	}
}