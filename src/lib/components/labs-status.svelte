<script lang="ts">
	import { LAB_IDS, LAB_LABELS } from '$lib/labs';
	import { getLabs } from '$lib/stores/labs.svelte';
	import { getLanyard } from '$lib/stores/lanyard.svelte';
	import DitherChart from './dither-chart.svelte';
	import Reel from './reel.svelte';

	const labs = getLabs();
	const presence = getLanyard();
	// The same lightened accent the presence meter glows with.
	const tint = $derived({
		r: Math.round(presence.color.r * 0.3 + 245 * 0.7),
		g: Math.round(presence.color.g * 0.3 + 245 * 0.7),
		b: Math.round(presence.color.b * 0.3 + 247 * 0.7)
	});
	const digits = (value: number) => String(Math.round(value)).padStart(2, '0');
</script>

<!-- Only mounted once the first poll returns data, so it animates in with real numbers. -->
{#if labs.ready}
	<div class="labs" role="group" aria-label="Server resource usage">
		{#each LAB_IDS as id, i (id)}
			{@const lab = labs.labs.find((item) => item.id === id)}
			{@const online = lab?.online ?? false}
			<div class="lab" class:offline={!online} style:--i={i}>
				<div class="head">
					<span class="dot" data-online={online}></span>
					<span class="name">{LAB_LABELS[id]}</span>
					{#if !online}<span class="state">offline</span>{/if}
				</div>
				<div class="readout">
					<span>cpu <b class="digits"><Reel value={online && lab ? digits(lab.cpu) : '--'} />%</b></span>
					<span>ram <b class="digits"><Reel value={online && lab ? digits(lab.mem) : '--'} />%</b></span>
					{#if lab?.gpu}
						<span>gpu <b class="digits"><Reel value={online ? digits(lab.gpu.util) : '--'} />%</b></span>
					{:else}
						<span>disk <b class="digits"><Reel value={online && lab ? digits(lab.disk) : '--'} />%</b></span>
					{/if}
				</div>
				<div class="chart">
					<DitherChart
						color={tint}
						height={30}
						series={[
							{ data: online ? (lab?.hist.mem ?? []) : [], density: 0.45 },
							...(lab?.gpu && lab.hist.gpu.length
								? [{ data: online ? lab.hist.gpu : [], density: 0.7 }]
								: []),
							{ data: online ? (lab?.hist.cpu ?? []) : [], density: 1 }
						]}
					/>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.labs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 14px 18px;
		padding: 12px 14px;
		color: #f5f5f7;
		border-radius: 12px;
		background: #0b0b10;
		box-shadow:
			inset 0 0 0 1px rgb(242 238 234 / 0.08),
			0 12px 32px rgb(0 0 0 / 0.45);
		animation: lab-in 450ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
	}
	/* Same entrance as the presence card: each lab fades up from a blur, one after the other. */
	.lab {
		min-width: 0;
		animation: lab-in 450ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
		animation-delay: calc(80ms + var(--i) * 70ms);
	}
	@keyframes lab-in {
		from {
			opacity: 0;
			filter: blur(4px);
			transform: translateY(6px);
		}
	}
	.head {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.2;
	}
	.state {
		margin-left: auto;
		font-size: 12px;
		color: rgb(245 245 247 / 0.5);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #92949b;
		transition: background-color 250ms ease;
	}
	.dot[data-online='true'] {
		background: #55c58a;
		box-shadow: 0 0 6px rgb(85 197 138 / 0.6);
	}
	.readout {
		display: flex;
		gap: 12px;
		margin: 6px 0 8px;
		font-size: 12px;
		font-weight: 600;
		line-height: 1.2;
		color: rgb(245 245 247 / 0.5);
	}
	.readout span {
		display: flex;
		align-items: baseline;
		gap: 4px;
	}
	/* Dot-matrix readout, in the same face as the presence time and the clock. */
	.digits {
		font-family: 'Doto Variable', var(--font-mono);
		font-size: 14px;
		font-weight: 800;
		letter-spacing: 0.04em;
		color: #f2eeea;
		font-variant-numeric: tabular-nums;
	}
	.chart {
		transition: opacity 250ms ease;
	}
	.offline .chart {
		opacity: 0.25;
	}
	@media (prefers-reduced-motion: reduce) {
		.labs,
		.lab {
			animation: none;
		}
		.dot,
		.chart {
			transition: none;
		}
	}
</style>
