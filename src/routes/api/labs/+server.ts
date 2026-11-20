import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { cleanLabs } from '$lib/labs';
import type { RequestHandler } from './$types';

// The browser never talks to the lab. This route holds the token, caches for a few seconds
// (so visitor count can't turn into load on the home machine) and sanitises what comes back.
const TTL = 5;

export const GET: RequestHandler = async ({ request }) => {
	if (!env.LABS_URL || !env.LABS_TOKEN) return json({ labs: [] }, { status: 503 });

	// Cloudflare's per-colo cache; absent under `vite dev`.
	const edge = (globalThis as { caches?: { default?: Cache } }).caches?.default;
	const key = new Request(new URL('/api/labs', request.url).toString());
	const hit = await edge?.match(key);
	if (hit) return hit;

	let labs: ReturnType<typeof cleanLabs> = [];
	try {
		const response = await fetch(env.LABS_URL, {
			headers: { authorization: `Bearer ${env.LABS_TOKEN}` },
			signal: AbortSignal.timeout(3000),
			redirect: 'manual' // Workers has no 'error'; a 3xx is not ok, so it is treated as a failure
		});
		if (response.ok) {
			const body = await response.json();
			labs = cleanLabs(body);
			console.log('labs origin ok', response.status, Object.keys(body ?? {}), labs.length);
		}
		else console.error('labs origin answered', response.status);
	} catch (error) {
		// An empty list renders as no widget; the reason goes to the logs (never the token).
		console.error('labs origin unreachable', String(error));
	}

	// Failures are cached too, so a dead origin gets one request per window, not one per visitor.
	const result = json({ labs }, { headers: { 'cache-control': `public, max-age=${TTL}` } });
	await edge?.put(key, result.clone());
	return result;
};
