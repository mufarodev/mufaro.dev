import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function rgbToHex(r: number, g: number, b: number): string {
	return (
		'#' +
		[r, g, b]
			.map((x) => {
				const hex = x.toString(16);
				return hex.length === 1 ? '0' + hex : hex;
			})
			.join('')
	);
}

export function createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = URL.createObjectURL(blob);
	});
}

export function getLuminance(r: number, g: number, b: number): number {
	const [rs, gs, bs] = [r, g, b].map((c) => {
		c /= 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastColor(r: number, g: number, b: number): 'black' | 'white' {
	const luminance = getLuminance(r, g, b);
	return luminance > 0.179 ? 'black' : 'white';
}

export function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
	const toLinear = (val: number) => {
		const v = val / 255;
		return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	const lr = toLinear(r);
	const lg = toLinear(g);
	const lb = toLinear(b);

	const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
	const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
	const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

	const l_cr = Math.cbrt(l_);
	const m_cr = Math.cbrt(m_);
	const s_cr = Math.cbrt(s_);

	const ok_l = 0.2104542553 * l_cr + 0.793617785 * m_cr - 0.0040720468 * s_cr;
	const ok_a = 1.9779984951 * l_cr - 2.428592205 * m_cr + 0.4505937099 * s_cr;
	const ok_b = 0.0259040371 * l_cr + 0.7827717662 * m_cr - 0.808675766 * s_cr;

	const C = Math.sqrt(ok_a * ok_a + ok_b * ok_b);
	let H = (Math.atan2(ok_b, ok_a) * 180) / Math.PI;
	if (H < 0) H += 360;

	return { l: ok_l, c: C, h: isNaN(H) ? 0 : H };
}

export function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
	const h_rad = (h * Math.PI) / 180;
	const a = c * Math.cos(h_rad);
	const b = c * Math.sin(h_rad);

	const l_cr = l + 0.3963377774 * a + 0.2158037573 * b;
	const m_cr = l - 0.1055613458 * a - 0.0638541728 * b;
	const s_cr = l - 0.0894841775 * a - 1.291485548 * b;

	const l_ = l_cr * l_cr * l_cr;
	const m_ = m_cr * m_cr * m_cr;
	const s_ = s_cr * s_cr * s_cr;

	const lr = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
	const lg = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
	const lb = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

	const toSRGB = (val: number) => {
		const v = Math.max(0, Math.min(1, val));
		return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
	};

	return {
		r: Math.round(toSRGB(lr) * 255),
		g: Math.round(toSRGB(lg) * 255),
		b: Math.round(toSRGB(lb) * 255)
	};
}

export function adjustColorForDisplay(
	r: number,
	g: number,
	b: number
): { r: number; g: number; b: number; l: number; c: number; h: number } {
	const { l, c, h } = rgbToOklch(r, g, b);
	const adjustedL = Math.max(0.42, Math.min(0.60, l));
	let adjustedC = c;
	if (c > 0.03) {
		adjustedC = Math.max(0.06, Math.min(0.12, c));
	} else {
		adjustedC = Math.max(0, Math.min(0.03, c));
	}
	const rgb = oklchToRgb(adjustedL, adjustedC, h);
	return {
		...rgb,
		l: adjustedL,
		c: adjustedC,
		h
	};
}

export async function extractDominantColor(
	imageBuffer: ArrayBuffer
): Promise<{ r: number; g: number; b: number; l: number; c: number; h: number }> {
	const blob = new Blob([imageBuffer]);
	const img = await createImageFromBlob(blob);

	const canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;

	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) return { r: 120, g: 120, b: 120, l: 0.5, c: 0, h: 0 };
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

	const centerX = Math.floor(canvas.width / 2);
	const centerY = Math.floor(canvas.height / 2);
	const sampleWidth = Math.floor(canvas.width * 0.85);
	const sampleHeight = Math.floor(canvas.height * 0.85);
	const startX = Math.max(0, centerX - Math.floor(sampleWidth / 2));
	const startY = Math.max(0, centerY - Math.floor(sampleHeight / 2));

	const imageData = ctx.getImageData(startX, startY, sampleWidth, sampleHeight);
	const data = imageData.data;

	const bucketSize = 15;
	const colorMap: Record<
		string,
		{ r: number; g: number; b: number; count: number; oklch: { l: number; c: number; h: number } }
	> = {};

	for (let i = 0; i < data.length; i += 16) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const a = data[i + 3];

		if (a < 128) continue;

		const brightness = (r + g + b) / 3;
		if (brightness < 12 || brightness > 243) continue;

		const rKey = Math.round(r / bucketSize) * bucketSize;
		const gKey = Math.round(g / bucketSize) * bucketSize;
		const bKey = Math.round(b / bucketSize) * bucketSize;
		const key = `${rKey},${gKey},${bKey}`;

		if (!colorMap[key]) {
			const oklch = rgbToOklch(rKey, gKey, bKey);
			colorMap[key] = { r: rKey, g: gKey, b: bKey, count: 0, oklch };
		}
		colorMap[key].count++;
	}

	const colors = Object.values(colorMap);
	if (colors.length === 0) {
		return { r: 120, g: 120, b: 120, l: 0.5, c: 0, h: 0 };
	}

	const vibrantColors = colors.filter((c) => c.oklch.c >= 0.04);

	let bestColor: { r: number; g: number; b: number };

	if (vibrantColors.length > 0) {
		let maxScore = -1;
		let selected = vibrantColors[0];

		for (const color of vibrantColors) {
			const lightnessFactor = 1.0 - Math.abs(0.52 - color.oklch.l);
			const score = color.count * Math.pow(color.oklch.c, 1.5) * lightnessFactor;
			if (score > maxScore) {
				maxScore = score;
				selected = color;
			}
		}
		bestColor = { r: selected.r, g: selected.g, b: selected.b };
	} else {
		let maxScore = -1;
		let selected = colors[0];

		for (const color of colors) {
			const chromaBonus = 1.0 + color.oklch.c * 10;
			const lightnessFactor = 1.0 - Math.abs(0.52 - color.oklch.l);
			const score = color.count * chromaBonus * lightnessFactor;
			if (score > maxScore) {
				maxScore = score;
				selected = color;
			}
		}
		bestColor = { r: selected.r, g: selected.g, b: selected.b };
	}

	return adjustColorForDisplay(bestColor.r, bestColor.g, bestColor.b);
}
