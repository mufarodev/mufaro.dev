export const LAB_LABELS = { vm: 'Dev VM', ai: 'AI Lab' } as const;
export type LabId = keyof typeof LAB_LABELS;
export const LAB_IDS = Object.keys(LAB_LABELS) as LabId[];

export type Lab = {
	id: LabId;
	online: boolean;
	cpu: number;
	mem: number;
	disk: number;
	gpu: { util: number; mem: number } | null;
	hist: { cpu: number[]; mem: number[]; gpu: number[] };
};

const percent = (value: unknown) =>
	typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
const series = (value: unknown) => (Array.isArray(value) ? value.slice(-48).map(percent) : []);

// The origin is ours, but the browser only ever sees what passes through here:
// known ids, clamped numbers, nothing else.
export function cleanLabs(body: unknown): Lab[] {
	const raw = (body as { labs?: unknown })?.labs;
	if (!Array.isArray(raw)) return [];
	return LAB_IDS.flatMap((id) => {
		const lab = raw.find((item) => item?.id === id);
		if (!lab) return [];
		const gpu = lab.gpu && typeof lab.gpu === 'object' ? lab.gpu : null;
		return [
			{
				id,
				online: lab.online === true,
				cpu: percent(lab.cpu),
				mem: percent(lab.mem),
				disk: percent(lab.disk),
				gpu: gpu ? { util: percent(gpu.util), mem: percent(gpu.mem) } : null,
				hist: { cpu: series(lab.hist?.cpu), mem: series(lab.hist?.mem), gpu: series(lab.hist?.gpu) }
			}
		];
	});
}
