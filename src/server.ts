/*
 * Module dependencies.
 */
import fs from "fs";
import http from "http";
import path from "path";

import app from "./app";

if (process.env.NODE_ENV === "development")
	var debug = require("debug")("mcbewrs:server");

/*
 * Get port from environment and store in Express.
 */
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "config.json"), "utf-8"));

const port = normalizePort(process.env.PORT || config.port || "2909");
app.set("port", port);

/*
 * Listen on provided port, on all network interfaces.
 * Create HTTP server.
 */
const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/*
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string): string|number|false {
	const port = parseInt(val, 10);

	// Named pipe
	if (isNaN(port))
		return val;

	// Port number
	if (port >= 0)
		return port;

	return false;
}

/*
 * Event listener for HTTP server "error" event.
 */
/* TODO: Get a proper type for this error */
// @ts-ignore
function onError(error) {
	if (error.syscall !== "listen")
		throw error;

	const bind = (typeof port === "string") ? "Pipe " + port : "Port " + port;

	// Handle specific listen errors with friendly messages
	switch (error.code) {
	case "EACCES":
		console.error(bind + " requires elevated privileges");
		process.exit(1);

	case "EADDRINUSE":
		console.error(bind + " is already in use");
		process.exit(1);

	default:
		throw error;
	}
}

/*
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
	const addr = server.address();
	const bind = (typeof addr === "string") ? ("pipe " + addr) : ("port " + addr?.port);

	try {
		debug("Listening on " + bind);
	} catch (e) { console.log("Started in production mode"); }
}
