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

/**
 * Extracts the dominant mid-tone colour from an image ArrayBuffer.
 * Shared by all Discord activity components that need album art colour extraction.
 */
export async function extractDominantColor(
	imageBuffer: ArrayBuffer
): Promise<{ r: number; g: number; b: number }> {
	const blob = new Blob([imageBuffer]);
	const img = await createImageFromBlob(blob);

	const canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;

	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) return { r: 30, g: 30, b: 30 };
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

	// sample 70% of the image
	const centerX = Math.floor(canvas.width / 2);
	const centerY = Math.floor(canvas.height / 2);
	const sampleWidth = Math.floor(canvas.width * 0.7);
	const sampleHeight = Math.floor(canvas.height * 0.7);
	const startX = Math.max(0, centerX - Math.floor(sampleWidth / 2));
	const startY = Math.max(0, centerY - Math.floor(sampleHeight / 2));

	const imageData = ctx.getImageData(startX, startY, sampleWidth, sampleHeight);
	const data = imageData.data;

	const colorMap: Record<
		string,
		{ r: number; g: number; b: number; brightness: number; count: number }
	> = {};

	let totalBrightness = 0;
	let validPixels = 0;

	// sample every 3rd pixel
	for (let i = 0; i < data.length; i += 12) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		const brightness = (r + g + b) / 3;
		totalBrightness += brightness;
		validPixels++;

		if (brightness < 15 || brightness > 240) continue;

		const rKey = Math.round(r / 20) * 20;
		const gKey = Math.round(g / 20) * 20;
		const bKey = Math.round(b / 20) * 20;
		const key = `${rKey},${gKey},${bKey}`;

		if (!colorMap[key]) {
			colorMap[key] = { r: rKey, g: gKey, b: bKey, brightness, count: 0 };
		}
		colorMap[key].count++;
	}

	const avgBrightness = totalBrightness / validPixels;
	const isDarkImage = avgBrightness < 60;

	let dominant: { r: number; g: number; b: number; brightness: number } = {
		r: 30,
		g: 30,
		b: 30,
		brightness: 30
	};
	let maxCount = 0;

	for (const color of Object.values(colorMap)) {
		if (color.count > maxCount) {
			maxCount = color.count;
			dominant = color;
		}
	}

	if (maxCount === 0 || (isDarkImage && dominant.brightness > 80)) {
		return { r: 30, g: 30, b: 30 };
	}

	return { r: dominant.r, g: dominant.g, b: dominant.b };
}
