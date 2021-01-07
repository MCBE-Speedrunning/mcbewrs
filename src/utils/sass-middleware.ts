import path from "path";
import fs from "fs";
import sass from "sass";
import { Request, Response, NextFunction } from "express";

interface Cache {
	[path: string]: sass.Result;
}

const cache: Cache = {};

export default async function renderSass(
	req: Request,
	res: Response,
	next: NextFunction
) {
	// Ignore non-CSS requests
	if (!req.path.endsWith(".css")) return next();

	// Derive SCSS filepath from CSS request path
	const file = path
		.join(process.cwd(), "public", "cdn", req.path)
		.replace(".css", ".scss");
	if (!fs.existsSync(file)) return res.status(404).end();

	// Cache rendered CSS in memory
	if (!cache[req.path] || process.env.NODE_ENV != "production") {
		cache[req.path] = sass.renderSync({
			file,
			includePaths: [path.join(process.cwd(), "node_modules")],
			outputStyle:
				process.env.NODE_ENV === "production"
					? "compressed"
					: "expanded",
			sourceMap: process.env.NODE_ENV === "production" ? false : true,
			sourceMapEmbed: true,
		});
	}

	res.header("content-type", "text/css");
	res.send(cache[req.path].css.toString());
}