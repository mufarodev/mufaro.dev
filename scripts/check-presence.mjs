// Run with: node --experimental-strip-types scripts/check-presence.mjs
import assert from 'node:assert/strict';
import { activityImage, formatDuration, getActivity, getPlayback } from '../src/lib/presence.ts';

const data = {
	active_on_discord_mobile: false,
	active_on_discord_desktop: true,
	active_on_discord_embedded: false,
	active_on_discord_web: false,
	kv: {},
	discord_user: {
		id: '123',
		username: 'mufaro',
		discriminator: '0',
		avatar: null,
		global_name: null
	},
	discord_status: /** @type {const} */ ('online'),
	listening_to_spotify: false,
	spotify: null,
	activities: [
		{ id: 'game', name: 'Game', type: 0, created_at: 0 },
		{ id: 'music', name: 'Music', details: 'Track', state: 'Artist', type: 2, created_at: 0 },
		{ id: 'custom', name: 'Custom Status', state: 'Hello', type: 4, created_at: 0 }
	]
};

assert.equal(getActivity(data)?.title, 'Track', 'Listening wins regardless of activity order');
assert.equal(
	getActivity({ ...data, activities: [data.activities[2]] }),
	null,
	'Custom status is not an activity'
);
assert.equal(
	getActivity({ ...data, discord_status: 'offline' }),
	null,
	'Do not display stale offline activity'
);
assert.equal(getActivity(null), null);
assert.equal(getActivity({ ...data, activities: [data.activities[0]] })?.music, false);
assert.equal(
	getActivity({
		...data,
		listening_to_spotify: true,
		spotify: {
			song: 'Spotify track',
			artist: 'Artist',
			album: 'Album',
			album_art_url: 'https://example.com/art.jpg',
			track_id: 'id',
			timestamps: { start: 0, end: 1000 }
		}
	})?.title,
	'Spotify track',
	'Use the dedicated Spotify payload'
);

assert.equal(getPlayback(undefined, 0), null);
for (const timestamps of [
	{ start: 1, end: 1 },
	{ start: 2, end: 1 },
	{ start: NaN, end: 1 },
	{ start: 1, end: Infinity },
	{ start: 1 }
]) {
	assert.equal(getPlayback(timestamps, 2), null, 'Ignore missing or invalid durations');
}
assert.deepEqual(getPlayback({ start: 100, end: 200 }, 50), {
	elapsed: 0,
	duration: 100,
	progress: 0
});
assert.deepEqual(getPlayback({ start: 100, end: 200 }, 150), {
	elapsed: 50,
	duration: 100,
	progress: 0.5
});
assert.deepEqual(getPlayback({ start: 100, end: 200 }, 300), {
	elapsed: 100,
	duration: 100,
	progress: 1
});
assert.equal(formatDuration(-1000), '0:00');
assert.equal(formatDuration(61000), '1:01');
assert.equal(activityImage('spotify:cover'), 'https://i.scdn.co/image/cover');
assert.equal(activityImage('mp:external/key'), 'https://media.discordapp.net/external/key');
assert.equal(activityImage('cover', 'app'), 'https://cdn.discordapp.com/app-assets/app/cover.png');
assert.equal(activityImage('https://example.com/art.jpg'), 'https://example.com/art.jpg');
assert.equal(activityImage('unknown'), null);
console.log('Presence checks passed');
