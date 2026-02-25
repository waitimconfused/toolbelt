import Colour from "./src/extras/Colour.js";
import { Controller } from "./src/inputs/Controller.js";
import TBDatabase from "./src/extras/Database.js";
import { files } from "./src/extras/Files.js";
import { range, round } from "./src/math/Range.js";
import { Vector } from "./src/math/Vector.js";

import keyboard from "./src/inputs/Keyboard.js";
import mouse from "./src/inputs/Mouse.js";

import { CustomMenu } from "./src/extras/CustomMenu.js";
import CustomUnitConverter, { getValue, unitConverter } from "./src/math/Units.js";

import { image } from "./src/extras/Image.js";
import { Point2, Point3, Point4 } from "./src/math/Points.js";

window.toolbelt = {
	keyboard, mouse,
	Controller,
	Database: TBDatabase,
	Colour, Color: Colour,
	CustomUnitConverter, getValue, unitConverter,
	range, round, Vector,
	files,
	CustomMenu,
	image,
	Point2, Point3, Point4,
};

export {
	keyboard, mouse,
	Controller,
	TBDatabase as Database,
	Colour, Colour as Color,
	CustomUnitConverter, getValue, unitConverter,
	range, round, Vector,
	files,
	CustomMenu,
	image,
	Point2, Point3, Point4
};