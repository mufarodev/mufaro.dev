<script lang="ts">
	import SoftButton from '$lib/components/shared/soft-button.svelte';
	import { onMount } from 'svelte';

	const email = 'hello@mufaro.dev';
	const socials = [
		{ label: 'GitHub', href: 'https://github.com/mufarodev' },
		{ label: 'Twitter', href: 'https://twitter.com/mufarodev' },
		{ label: 'LinkedIn', href: 'https://linkedin.com/in/mufaro' }
	];

	let copied = $state(false);

	function copyEmail() {
		navigator.clipboard.writeText(email);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1500);
	}
</script>

<footer
	id="contact"
	class="relative mt-24 border-t border-border bg-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
>
	<div class="mx-auto max-w-[1120px] px-6 py-16 text-center sm:px-8 sm:py-20">
		<h2 class="mb-4 font-display text-3xl sm:text-4xl">Let's work together</h2>

		<p class="lead mx-auto mb-8 max-w-xl text-muted-foreground">
			Open to full-time opportunities and interesting projects. Feel free to reach out.
		</p>

		<div class="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
			<SoftButton variant="primary" onclick={copyEmail} withGlow class="min-w-[200px]">
				{copied ? 'Copied!' : 'Copy Email'}
			</SoftButton>

			<SoftButton variant="secondary" href={`mailto:${email}`} class="min-w-[200px]">
				Send Email
			</SoftButton>
		</div>

		<div class="mb-8 flex items-center justify-center gap-6">
			{#each socials as social}
				<a
					href={social.href}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					{social.label}
				</a>
			{/each}
		</div>

		<div class="flex items-center justify-center gap-2 text-xs text-muted-foreground">
			<span>© 2024 Mufaro Mukotami</span>
			<span>•</span>
			<span>Built with SvelteKit</span>
		</div>
	</div>
</footer>
