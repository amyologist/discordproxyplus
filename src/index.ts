import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config, getNextToken } from "./config.ts";
import { identify } from "./lib/discord.ts";

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
app.get("/", (c) => {
	return c.json({
		penis: "psusy",
	});
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
