import { httpJson } from "./http.ts";

export async function identify(token: string) {
	const data = await httpJson("https://discord.com/api/v10/users/@me", {
		headers: {
			Authorization: `Bot ${token}`,
		},
	}).catch(() => {
		return null;
	});
	if (!data) return;
	return `${data.username}#${data.discriminator} (${data.id})`;
}
