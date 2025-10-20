<!-- <div
	class="pointer-events-none fixed right-0 bottom-0 left-0 z-100 mx-auto max-w-7xl mask-[linear-gradient(0deg,#000_30%,transparent)] backdrop-blur-[16px]"
	style="height: clamp(60px, 10vh, 300px);"
></div>

<div
	class="pointer-events-none fixed right-0 bottom-10 left-0 z-100 mx-auto max-w-7xl mask-[linear-gradient(0deg,#000_30%,transparent)] backdrop-blur-[2px]"
	style="height: clamp(60px, 10vh, 300px);"
></div> -->

<div class="progressive-blur-container">
	<div class="blur-filter"></div>
	<div class="blur-filter"></div>
	<div class="blur-filter"></div>
	<div class="blur-filter"></div>
	<div class="blur-filter"></div>
	<div class="blur-filter"></div>
	<div class="blur-filter"></div>
	<div class="gradient"></div>
</div>

<style>
	.progressive-blur-container {
		position: fixed;
		left: 0;
		bottom: 0;
		right: 0;
		width: 100%;
		height: 10vh;
		z-index: 9999;
		pointer-events: none;
	}

	.progressive-blur-container > .blur-filter {
		position: fixed;
		left: 0;
		bottom: 0;
		right: 0;
		margin: 0 auto;
		height: 10vh;
	}

	.progressive-blur-container > .blur-filter:nth-child(1) {
		backdrop-filter: blur(1px);
		mask: linear-gradient(
			rgba(var(--pg-bg), 0),
			rgba(var(--pg-bg), 1) 10%,
			rgba(var(--pg-bg), 1) 30%,
			rgba(var(--pg-bg), 0) 40%
		);
	}

	.progressive-blur-container > .blur-filter:nth-child(2) {
		backdrop-filter: blur(2px);
		mask: linear-gradient(
			rgba(var(--pg-bg), 0) 10%,
			rgba(var(--pg-bg), 1) 20%,
			rgba(var(--pg-bg), 1) 40%,
			rgba(var(--pg-bg), 0) 50%
		);
	}

	.progressive-blur-container > .blur-filter:nth-child(3) {
		backdrop-filter: blur(4px);
		mask: linear-gradient(
			rgba(var(--pg-bg), 0) 15%,
			rgba(var(--pg-bg), 1) 30%,
			rgba(var(--pg-bg), 1) 50%,
			rgba(var(--pg-bg), 0) 60%
		);
	}

	.progressive-blur-container > .blur-filter:nth-child(4) {
		backdrop-filter: blur(8px);
		mask: linear-gradient(
			rgba(var(--pg-bg), 0) 20%,
			rgba(var(--pg-bg), 1) 40%,
			rgba(var(--pg-bg), 1) 60%,
			rgba(var(--pg-bg), 0) 70%
		);
	}

	.progressive-blur-container > .blur-filter:nth-child(5) {
		backdrop-filter: blur(16px);
		mask: linear-gradient(
			rgba(var(--pg-bg), 0) 40%,
			rgba(var(--pg-bg), 1) 60%,
			rgba(var(--pg-bg), 1) 80%,
			rgba(var(--pg-bg), 0) 90%
		);
	}

	.progressive-blur-container > .blur-filter:nth-child(6) {
		backdrop-filter: blur(32px);
		mask: linear-gradient(rgba(var(--pg-bg), 0) 60%, rgba(var(--pg-bg), 1) 80%);
	}

	.progressive-blur-container > .blur-filter:nth-child(7) {
		z-index: 10;
		backdrop-filter: blur(64px);
		mask: linear-gradient(rgba(var(--pg-bg), 0) 70%, rgba(var(--pg-bg), 1) 100%);
	}

	.progressive-blur-container > .gradient {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 10vh;
		background: linear-gradient(transparent, rgba(var(--pg-bg), 1));
	}
</style>
