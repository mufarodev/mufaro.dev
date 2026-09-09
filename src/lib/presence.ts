import type { LanyardPresenceData } from 'sveltekit-lanyard';

export const statusLabels = {
	online: 'Online',
	idle: 'Away',
	dnd: 'Do not disturb',
	offline: 'Offline'
};

export function activityImage(image?: string, applicationId?: string): string | null {
	if (!image) return null;
	if (image.startsWith('https://')) return image;
	if (image.startsWith('mp:external/')) {
		return image.replace('mp:external/', 'https://media.discordapp.net/external/');
	}
	if (image.startsWith('spotify:')) return `https://i.scdn.co/image/${image.slice(8)}`;
	return applicationId
		? `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`
		: null;
}

export function getActivity(data: LanyardPresenceData | null) {
	if (!data || data.discord_status === 'offline') return null;
	if (data.listening_to_spotify && data.spotify) {
		return {
			music: true,
			service: 'Spotify',
			title: data.spotify.song,
			subtitle: data.spotify.artist,
			image: activityImage(data.spotify.album_art_url),
			timestamps: data.spotify.timestamps,
			href: `https://open.spotify.com/track/${encodeURIComponent(data.spotify.track_id)}`
		};
	}
	// Custom statuses aren't activities, and listening takes precedence over a running app.
	const activity =
		data.activities.find((activity) => activity.type === 2) ??
		data.activities.find((activity) => activity.type !== 4);
	if (!activity) return null;
	return {
		music: activity.type === 2,
		service: activity.name,
		title: activity.type === 2 ? activity.details || activity.name : activity.name,
		subtitle:
			activity.type === 2
				? activity.state || ''
				: [activity.details, activity.state].filter(Boolean).join(' · '),
		image: activityImage(activity.assets?.large_image, activity.application_id),
		timestamps: activity.timestamps,
		href: null
	};
}

export function getPlayback(timestamps: { start?: number; end?: number } | undefined, now: number) {
	const { start, end } = timestamps ?? {};
	if (
		start === undefined ||
		end === undefined ||
		!Number.isFinite(start) ||
		!Number.isFinite(end) ||
		end <= start
	) {
		return null;
	}
	const duration = end - start;
	const elapsed = Math.min(duration, Math.max(0, now - start));
	return { elapsed, duration, progress: elapsed / duration };
}

export function formatDuration(milliseconds: number) {
	const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
