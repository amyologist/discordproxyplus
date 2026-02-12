import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config, getNextToken } from "./config.ts";
import {
	getAnimatedImageData,
	getJsonData,
	getStillImageData,
	identify,
} from "./lib/discord.ts";

config.tokens.forEach(async (i, v) => {
	const identity = await identify(i);
	if (!identity) {
		console.error(
			`invalid token: ${i.length === 0 ? "<empty token>" : `${i}`} at ${v}`,
		);
	} else {
		console.log(`logged in as ${identity}`);
	}
});

const app = new Hono();
app.get("/:id{.+\\.json}", async (c) => {
	const fullId = c.req.param("id");
	const id = fullId.replace(".json", "");
	const meow = await getJsonData(id);
	if (!meow.ok) {
		return c.json(meow, 500);
	}
	return c.json(meow);
});

app.get("/:id{.+\\.png}", async (c) => {
	const fullId = c.req.param("id");
	const id = fullId.replace(".png", "");
	const meow = await getStillImageData(id);
	if (!meow) {
		return c.status(500);
	}
	c.header("Content-Type", "image/png");
	return c.body(new Uint8Array(meow));
});

app.get("/:id{.+\\.gif}", async (c) => {
	const fullId = c.req.param("id");
	const id = fullId.replace(".gif", "");
	const meow = await getAnimatedImageData(id);
	if (!meow) {
		return c.status(500);
	}
	c.header("Content-Type", "image/gif");
	return c.body(new Uint8Array(meow));
});

const server = serve({
	fetch: app.fetch,
	port: 8787,
});
process.on("SIGINT", () => {
	server.close();
	process.exit(0);
});
process.on("SIGTERM", () => {
	server.close((err) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		process.exit(0);
	});
});
