import { getWeather } from '$lib/weather';

// Fetched on the server so the weather is in the first paint instead of popping in later.
export const load = async ({ fetch }) => ({ weather: await getWeather(fetch) });
