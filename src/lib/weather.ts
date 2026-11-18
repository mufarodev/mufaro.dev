import type { Icon } from '$lib/components/weather-icon.svelte';

// Open-Meteo needs no key. ponytail: Warsaw coords stand in for "Poland"; swap for your city.
const URL =
	'https://api.open-meteo.com/v1/forecast?latitude=52.23&longitude=21.01&current=temperature_2m,weather_code,is_day';

// WMO weather codes, as the lowest code of each band.
const SKIES: [number, string, Icon][] = [
	[95, 'stormy', 'storm'],
	[85, 'snowy', 'snow'],
	[80, 'showery', 'rain'],
	[71, 'snowy', 'snow'],
	[61, 'rainy', 'rain'],
	[51, 'drizzly', 'drizzle'],
	[45, 'foggy', 'fog'],
	[3, 'cloudy', 'cloud'],
	[2, 'partly cloudy', 'partly'],
	[0, 'clear', 'sun']
];

export type Weather = { sky: string; icon: Icon; temp: number };

/** Current weather, or null if Open-Meteo is slow or down; the page just shows the time then. */
export async function getWeather(fetch: typeof globalThis.fetch): Promise<Weather | null> {
	try {
		// Short timeout: on the server this blocks the HTML.
		const { current: c } = await fetch(URL, { signal: AbortSignal.timeout(1000) }).then((r) =>
			r.json()
		);
		const [, sky, icon] = SKIES.find(([code]) => c.weather_code >= code) ?? SKIES.at(-1)!;
		const night = !c.is_day && (icon === 'sun' || icon === 'partly');
		return { sky, icon: night ? 'moon' : icon, temp: Math.round(c.temperature_2m) };
	} catch {
		return null;
	}
}
