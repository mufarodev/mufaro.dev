<script lang="ts">
	import ScrambleText from '$lib/components/core/scramble-text.svelte';
</script>

<div class="flex w-full flex-col items-center px-8 py-12 md:px-24">
	<div class="w-full max-w-4xl text-left">
		<h2 class="mb-8 font-serif text-6xl text-white md:text-8xl">
			<ScrambleText text="Experience" />
		</h2>

		<div class="space-y-16 border-l border-white/10 pl-4">
			<div class="group pl-8">
				<h3
					class="text-3xl font-medium text-white/90 transition-colors duration-300 group-hover:brightness-125"
					style="--tw-brightness: brightness(1.25);"
				>
					<ScrambleText text="Project Nova" scrambleSpeed={40} />
				</h3>
				<div class="mt-2 flex items-center gap-3 font-mono text-sm text-white/40">
					<span>2023 - Present</span>
					<span class="h-1 w-1 rounded-full bg-white/20"></span>
					<span
						class="accent-text"
						style="color: rgb(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170));"
						>Contributor & Frontend</span
					>
				</div>
				<p class="mt-4 max-w-2xl text-xl leading-relaxed text-white/60">
					Contributed to the web ecosystem for Project Nova, rebuilding the frontend architecture
					and implementing modern design systems.
				</p>
				<div class="mt-4 flex flex-wrap gap-2">
					<span class="rounded border border-white/10 px-2 py-1 font-mono text-xs text-white/40"
						>Astro</span
					>
					<span class="rounded border border-white/10 px-2 py-1 font-mono text-xs text-white/40"
						>TypeScript</span
					>
				</div>
			</div>

			<div class="group pt-8 pl-8">
				<h3
					class="text-3xl font-medium text-white/90 transition-colors duration-300 group-hover:brightness-125"
				>
					<ScrambleText text="Freelance" scrambleSpeed={40} />
				</h3>
				<div class="mt-2 flex items-center gap-3 font-mono text-sm text-white/40">
					<span>2021 - 2023</span>
					<span class="h-1 w-1 rounded-full bg-white/20"></span>
					<span
						class="accent-text"
						style="color: rgb(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170));"
						>Full Stack</span
					>
				</div>
				<p class="mt-4 max-w-2xl text-xl leading-relaxed text-white/60">
					Delivered custom web solutions for clients, focusing on performance optimization and
					unique interactive experiences.
				</p>
				<div class="mt-4 flex flex-wrap gap-2">
					<span class="rounded border border-white/10 px-2 py-1 font-mono text-xs text-white/40"
						>React</span
					>
					<span class="rounded border border-white/10 px-2 py-1 font-mono text-xs text-white/40"
						>Node.js</span
					>
				</div>
			</div>
		</div>
	</div>
</div>
