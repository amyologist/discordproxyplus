import { getNextToken } from "../config.ts";
import { httpBuffer, httpJson } from "./http.ts";

export async function identify(token: string) {
	const data = await httpJson(`https://discord.com/api/v10/users/@me`, {
		headers: {
			Authorization: `Bot ${token}`,
		},
	}).catch(() => {
		return null;
	});
	if (!data) return;
	return `${data.username}#${data.discriminator} (${data.id})`;
}

// this should only have two uses. i will punch you if you use this directly
// update: i just realized this has three uses. my year was ruined. i am currently having a mental breakdown while getting a divorce
async function getJsonWITHOUTcaching(token: string, id: string) {
	if (id === "@me") {
		return;
	}
	const data = await httpJson(`https://discord.com/api/v10/users/${id}`, {
		headers: {
			Authorization: `Bot ${token}`,
		},
	}).catch(() => {
		return;
	});
	if (!data) return;
	return data;
}

interface preferredUserObject {
	ok: true;
	id: string;
	username: string;
	avatar: {
		url: string;
		isAnimated: boolean;
	};
	bot: boolean;
	/*
	 *	why is this an any?
	 *	please refer to https://docs.discord.food/resources/user#user-object
	 * if you think you can do it, ill gladly take a pr!
	 * of course, youll complain, but you wont pr it.
	 */
	raw: any;
}
interface fuckedUpUserObject {
	ok: false;
	message: string;
}
export async function getJsonData(
	id: string,
): Promise<preferredUserObject | fuckedUpUserObject> {
	const meow = await getJsonWITHOUTcaching(getNextToken().token, id);
	if (!meow) {
		return {
			ok: false,
			message: "could not get object from discord",
		};
	}
	return {
		ok: true,
		avatar: {
			url: `https://cdn.discordapp.com/avatars/${meow.id}/${meow.avatar}.${(meow.avatar as string).startsWith("a_") ? "gif" : "png"}?size=2048`,
			isAnimated: (meow.avatar as string).startsWith("a_"),
		},
		bot: meow.bot ?? false,
		id: meow.id,
		username: meow.username,
		raw: { ...meow },
	};
}
export async function getStillImageData(
	id: string,
): Promise<Buffer | undefined> {
	const meow = await getJsonWITHOUTcaching(getNextToken().token, id);
	if (!meow) {
		return;
	}
	const url = `https://cdn.discordapp.com/avatars/${meow.id}/${meow.avatar}.png?size=2048`;

	const balls = await fetch(url);
	// if balls not ok:
	if (!balls.ok) {
		//you should see a doctor
		return;
	}
	if (!balls.headers.get("content-type")?.startsWith("image/")) {
		return;
	}
	return Buffer.from(await balls.arrayBuffer());
}

export async function getAnimatedImageData(
	id: string,
): Promise<Buffer | undefined> {
	const meow = await getJsonWITHOUTcaching(getNextToken().token, id);
	if (!meow) {
		return;
	}
	const url = `https://cdn.discordapp.com/avatars/${meow.id}/${meow.avatar}.gif?size=2048`;

	const ImNotMakingTheSameJokeAgain = await fetch(url);
	if (!ImNotMakingTheSameJokeAgain.ok) {
		return;
	}
	if (
		!ImNotMakingTheSameJokeAgain.headers
			.get("content-type")
			?.startsWith("image/")
	) {
		return;
	}
	return Buffer.from(await ImNotMakingTheSameJokeAgain.arrayBuffer());
}
