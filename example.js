import { mouse, Controller } from "./index.js";

// console.log( (new Vector("deg", 30, 0)).toString("deg") );

mouse.preventContextMenu = true;
mouse.preventScroll = true;

const mouseDot = document.getElementById("mouse-cursor");

mouse.on("move", () => {
	mouseDot.style.top = mouse.y + "px";
	mouseDot.style.left = mouse.x + "px";
});

mouse.on("lclick", () => {
	mouseDot.style.setProperty("--r", "255");
});

mouse.off("lclick", () => {
	mouseDot.style.setProperty("--r", "0");
});


mouse.on("rclick", () => {
	mouseDot.style.setProperty("--g", "255");
});

mouse.off("rclick", () => {
	mouseDot.style.setProperty("--g", "0");
});


mouse.on("wclick", () => {
	mouseDot.style.setProperty("--b", "255");
});

mouse.off("wclick", () => {
	mouseDot.style.setProperty("--b", "0");
});

const controller = Controller.layout.Xbox();

controller.listener.status("connect", () => {
	controller.vibrator.playEffect("dual-rumble", {
		startDelay: 0,
		duration: 300,
		weakMagnitude: 0.25,
		strongMagnitude: 0.5
	});
	document.getElementById("controller").style.display = null;
});

controller.listener.on("*", (name, value) => {
	if (name == "connect") return;

	let el = document.getElementById(name.replace(/\.(click|x|y)$/,""));
	if (!el) return;

	let rgb = "198,217,236";

	if (name.startsWith("trigger.")) {
		el.setAttribute("fill", `rgba(${rgb},${value})`);
	} else if (name.startsWith("joystick.")) {
		if (name.endsWith(".click")) {
			el.setAttribute("fill", value ? `rgba(${rgb},1)` : `rgb(${rgb},0)`);
		} else if (name.endsWith(".x")){
			let y = el.style.translate.split(" ")[1] ?? "0px";
			el.style.translate = (value*7)+ "px " + y;
		} else if (name.endsWith(".y")){
			let x = el.style.translate.split(" ")[0] ?? "0px";
			el.style.translate = x + " " + (value*7) +"px";
		}
	} else {
		el.setAttribute("fill", value ? `rgba(${rgb},1)` : `rgb(${rgb},0)`);
	}
});
