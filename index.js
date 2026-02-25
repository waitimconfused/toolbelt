import Colour from "./lib/Colour.js";
import { Controller } from "./lib/Controller.js";
import TBDatabase from "./lib/Database.js";
import { files } from "./lib/Files.js";
import { range, round } from "./lib/Range.js";
import { Vector } from "./lib/Vector.js";

import keyboard from "./lib/Keyboard.js";
import mouse from "./lib/Mouse.js";

import { CustomMenu } from "./lib/CustomMenu.js";
import CustomUnitConverter, { getValue, unitConverter } from "./lib/Units.js";

import { image } from "./lib/Image.js";
import { Point2, Point3, Point4 } from "./lib/Points.js";

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