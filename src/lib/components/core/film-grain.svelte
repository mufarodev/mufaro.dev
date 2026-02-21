<script lang="ts">
</script>

<div class="grain pointer-events-none fixed inset-0 z-[9999]"></div>

<style>
	.grain {
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
		opacity: 0.08;
		mix-blend-mode: soft-light;
		will-change: transform;
		animation: grain-shift 0.5s steps(4) infinite;
	}

	@keyframes grain-shift {
		0%,
		100% {
			transform: translate3d(0, 0, 0);
		}
		25% {
			transform: translate3d(-2%, -2%, 0);
		}
		50% {
			transform: translate3d(2%, 2%, 0);
		}
		75% {
			transform: translate3d(-2%, 2%, 0);
		}
	}
</style>
