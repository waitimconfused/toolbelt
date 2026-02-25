import Colour from "./extras/Colour.js";
import { Controller } from "./inputs/Controller.js";
import TBDatabase from "./extras/Database.js";
import { files } from "./extras/Files.js";
import { range, round } from "./math/Range.js";
import { Vector } from "./math/Vector.js";

import keyboard from "./inputs/Keyboard.js";
import mouse from "./inputs/Mouse.js";

import { CustomMenu } from "./extras/CustomMenu.js";
import CustomUnitConverter, { getValue, unitConverter } from "./math/Units.js";

import { image } from "./extras/Image.js";
import { Point2, Point3, Point4 } from "./math/Points.js";

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