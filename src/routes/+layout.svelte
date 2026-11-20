<script lang="ts">
	import '../app.css';
	import '$lib/styles/transitions.css';
	import { ModeWatcher } from 'mode-watcher';
	// The rond build carries the roundness axis the greeting uses, on top of weight.
	import '@fontsource-variable/google-sans-flex/rond.css';
	import '@fontsource-variable/doto';
	import sansFont from '@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-rond-normal.woff2?url';
	import dotoFont from '@fontsource-variable/doto/files/doto-latin-wght-normal.woff2?url';
	import { initLanyard } from '$lib/stores/lanyard.svelte';
	import { initLabs } from '$lib/stores/labs.svelte';

	initLanyard();
	initLabs();

	let { children } = $props();

	const site = 'https://mufaro.dev';
	const description = '18 year old software & reverse engineer from Poland';
	const avatar = `${site}/images/discord-avatar.webp`;
	const link = (label: string, url: string) => ({ type: 2, style: 5, label, url });

	// Discord components v2 embed: shown instead of the OG card when a link is posted in Discord.
	const embed = {
		component: {
			type: 17,
			accent_color: 0x363434,
			components: [
				{
					type: 9,
					components: [{ type: 10, content: `## **[Mufaro](${site})**\n${description}` }],
					accessory: { type: 11, media: { url: avatar } }
				},
				{ type: 14, spacing: 1 },
				{
					type: 1,
					components: [
						link('GitHub', 'https://github.com/mufarodev'),
						link('Twitter', 'https://x.com/mufaro_dev'),
						link('Discord', 'https://discord.com/users/769702535124090904')
					]
				}
			]
		}
	};
</script>

<ModeWatcher defaultMode="dark" />

<svelte:head>
	<title>Mufaro</title>
	<link rel="icon" type="image/x-icon" href="/images/embed.webp" />
	<!-- Fetched alongside the HTML so text doesn't reflow when the web font swaps in. -->
	<link rel="preload" as="font" type="font/woff2" href={sansFont} crossorigin="anonymous" />
	<link rel="preload" as="font" type="font/woff2" href={dotoFont} crossorigin="anonymous" />
	<meta name="description" content="18 year old software & reverse engineer from Poland" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Mufaro" />
	<meta property="og:description" content="18 year old software & reverse engineer from Poland" />
	<meta property="og:image" content={avatar} />
	<meta property="og:image:type" content="image/webp" />
	<meta name="theme-color" content="#363434" />
	{@html `<script id="discord:component-embed" type="application/json">${JSON.stringify(embed)}<\/script>`}
	<meta property="og:image:alt" content="Preview image for Mufaro's website" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Mufaro" />
	<meta name="twitter:description" content="18 year old software & reverse engineer from Poland" />
	<meta name="twitter:image" content={avatar} />
</svelte:head>

{@render children?.()}
