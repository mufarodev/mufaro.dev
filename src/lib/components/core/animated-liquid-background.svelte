<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let {
		color1 = '#B566FF',
		color2 = '#000000',
		color3 = '#000000',
		speed = 30,
		class: className = ''
	}: {
		color1?: string;
		color2?: string;
		color3?: string;
		speed?: number;
		class?: string;
	} = $props();

	const plasmaConfig = {
		rotation: 0,
		proportion: 63,
		scale: 1.2,
		distortion: 5,
		swirl: 61,
		swirlIterations: 5,
		softness: 100,
		offset: -168,
		shape: 0,
		shapeSize: 28
	};

	let canvas: HTMLCanvasElement;
	let shaderMount: ShaderMount | null = null;
	let animationSpeed = $derived((speed / 100) * 5);
	let visibilityListener: (() => void) | null = null;
	let reducedMotionListener: ((event: MediaQueryListEvent) => void) | null = null;
	let motionQuery: MediaQueryList | null = null;

	const PatternShapes = { Checks: 0, Stripes: 1, Edge: 2 };

	const RESIZE_THROTTLE_MS = 0;
	const RESIZE_SETTLE_MS = 180;
	const RESIZE_QUANTUM_PX = 1;

	function getShaderColorFromString(
		colorString: string | number[],
		fallback: number[] = [0, 0, 0, 1]
	): number[] {
		if (Array.isArray(colorString)) {
			if (colorString.length === 4) return colorString;
			if (colorString.length === 3) return [...colorString, 1];
			return getShaderColorFromString(fallback);
		}
		if (typeof colorString !== 'string') {
			return getShaderColorFromString(fallback);
		}

		let r: number,
			g: number,
			b: number,
			a = 1;

		if (colorString.startsWith('#')) {
			[r, g, b, a] = hexToRgba(colorString);
		} else if (colorString.startsWith('rgb')) {
			[r, g, b, a] = parseRgba(colorString);
		} else if (colorString.startsWith('hsl')) {
			[r, g, b, a] = hslaToRgba(parseHsla(colorString));
		} else {
			return getShaderColorFromString(fallback);
		}

		return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
	}

	function hexToRgba(hex: string): number[] {
		hex = hex.replace(/^#/, '');
		if (hex.length === 3) {
			hex = hex
				.split('')
				.map((char) => char + char)
				.join('');
		}
		if (hex.length === 6) {
			hex = hex + 'ff';
		}
		const r = parseInt(hex.slice(0, 2), 16) / 255;
		const g = parseInt(hex.slice(2, 4), 16) / 255;
		const b = parseInt(hex.slice(4, 6), 16) / 255;
		const a = parseInt(hex.slice(6, 8), 16) / 255;
		return [r, g, b, a];
	}

	function parseRgba(rgba: string): number[] {
		const match = rgba.match(
			/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i
		);
		if (!match) return [0, 0, 0, 1];
		return [
			parseInt(match[1] ?? '0') / 255,
			parseInt(match[2] ?? '0') / 255,
			parseInt(match[3] ?? '0') / 255,
			match[4] === undefined ? 1 : parseFloat(match[4])
		];
	}

	function parseHsla(hsla: string): number[] {
		const match = hsla.match(
			/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i
		);
		if (!match) return [0, 0, 0, 1];
		return [
			parseInt(match[1] ?? '0'),
			parseInt(match[2] ?? '0'),
			parseInt(match[3] ?? '0'),
			match[4] === undefined ? 1 : parseFloat(match[4])
		];
	}

	function hslaToRgba(hsla: number[]): number[] {
		const [h, s, l, a] = hsla;
		const sDecimal = s / 100;
		const lDecimal = l / 100;
		let r: number, g: number, b: number;

		if (s === 0) {
			r = g = b = lDecimal;
		} else {
			const hue2rgb = (p: number, q: number, t: number) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};
			const q =
				lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
			const p = 2 * lDecimal - q;
			const hDecimal = h / 360;
			r = hue2rgb(p, q, hDecimal + 1 / 3);
			g = hue2rgb(p, q, hDecimal);
			b = hue2rgb(p, q, hDecimal - 1 / 3);
		}
		return [r, g, b, a];
	}

	const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

	const warpFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_scale;
uniform vec4 u_color1;
uniform vec4 u_color2;

out vec4 fragColor;

float bQ(float x, float y) {
    return y * 3.0 + x * 2.0 - x * y * 4.0;
}

float getBayer8(vec2 p) {
    int x = int(p.x + 0.05) % 8;
    int y = int(p.y + 0.05) % 8;
    
    int x_mod2 = x % 2;
    int y_mod2 = y % 2;
    
    int x_mod4_div2 = (x % 4) / 2;
    int y_mod4_div2 = (y % 4) / 2;
    
    int x_div4 = x / 4;
    int y_div4 = y / 4;
    
    float val = (bQ(float(x_mod2), float(y_mod2)) * 16.0 + 
                 bQ(float(x_mod4_div2), float(y_mod4_div2)) * 4.0 + 
                 bQ(float(x_div4), float(y_div4))) / 64.0;
    return val;
}

void main() {
    // Aspect ratio correction to preserve shapes instead of stretching them
    vec2 screenUV = gl_FragCoord.xy / max(u_resolution.x, u_resolution.y);
    screenUV -= 0.5 * u_resolution.xy / max(u_resolution.x, u_resolution.y);
    
    // Zoom in/out using u_scale (0.75 zooms in, making shapes bigger)
    screenUV *= u_scale;
    
    screenUV += 0.5;
    
    float t = u_time * 0.4;
    // freq1 controls blob spatial density — 1.0 only fills ~1/3 cycle across
    // the screen (one giant blob). 3.0 gives ~1.5 visible cycles (3-4 distinct
    // blob regions), matching the shaders.com reference look.
    float freq1 = 3.0;
    
    vec2 d1 = vec2(
        screenUV.x + sin(screenUV.y * (freq1 * 1.7) + t * 0.8) * 0.12 + cos(screenUV.x * (freq1 * 0.9) - t * 0.5) * 0.05,
        screenUV.y + cos(screenUV.x * (freq1 * 1.3) - t * 0.6) * 0.12 + sin(screenUV.y * (freq1 * 1.1) + t * 0.7) * 0.05
    );
    
    float pattern1 = sin(d1.x * (freq1 * 2.1) + d1.y * (freq1 * 1.8) + t * 0.4);
    float freq2 = freq1 * 2.1;
    
    vec2 d2 = vec2(
        d1.x + cos(d1.y * (freq2 * 2.7) - t * 0.45) * 0.07 + sin(d1.x * (freq2 * 1.9) + t * 0.6) * 0.04,
        d1.y + sin(d1.x * (freq2 * 2.3) + t * 0.65) * 0.07 + cos(d1.y * (freq2 * 1.6) - t * 0.4) * 0.04
    );
    
    float pattern2 = cos(d2.x * (freq2 * 1.4) - d2.y * (freq2 * 1.9) + t * 0.35);
    float freq3 = freq1 * 3.7;
    
    vec2 d3 = vec2(
        d2.x + sin(d2.y * (freq3 * 1.8) + t * 0.85) * 0.04 + cos(d2.x * (freq3 * 1.3) - t * 0.55) * 0.025 + sin((d2.x + d2.y) * (freq3 * 0.7) + t * 0.9) * 0.02,
        d2.y + cos(d2.x * (freq3 * 1.6) - t * 0.75) * 0.04 + sin(d2.y * (freq3 * 1.1) + t * 0.5) * 0.025 + cos((d2.x + d2.y) * (freq3 * 0.8) - t * 0.95) * 0.02
    );
    
    float pattern3 = sin(d3.x * (freq3 * 1.1) + d3.y * (freq3 * 1.5) - t * 0.55);
    float combinedPattern = pattern1 * 0.45 + pattern2 * 0.35 + pattern3 * 0.2;
    
    float blendBias = (45.0 - 50.0) * 0.006;
    float blendFactor = smoothstep(0.3, 0.7, combinedPattern * 0.5 + 0.5 + blendBias);
    
    vec4 sourceColor = mix(u_color1, u_color2, blendFactor);
    
    // Applying Bayer 8x8 Dithering - Scaled by pixel ratio to make the X's large and visible
    // 2.5 multiplier creates a chunky retro pixel-art aesthetic without looking blurry
    float u_pixelSize = max(2.0, u_pixelRatio * 2.5); 
    vec2 pixelCoord = floor(gl_FragCoord.xy / u_pixelSize);
    float ditherValue = getBayer8(pixelCoord);
    
    float luminance = dot(sourceColor.rgb, vec3(0.299, 0.587, 0.114)) * sourceColor.a;
    float u_spread = 1.0;
    float u_threshold = 0.5;
    float ditherResult = step(0.5 + (ditherValue - 0.5) * u_spread, luminance + (u_threshold - 0.5));
    
    vec3 source = mix(sourceColor.rgb * 0.3, min(sourceColor.rgb * 1.3, vec3(0.95)), ditherResult);
    vec3 finalRGB = clamp(sourceColor.rgb / (vec3(1.0) - source), 0.0, 1.0);
    float finalAlpha = sourceColor.a;
    
    fragColor = vec4(finalRGB, finalAlpha);
}
`;

	const vertexShaderSource = `#version 300 es
layout(location = 0) in vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

	class ShaderMount {
		canvas: HTMLCanvasElement;
		gl: WebGL2RenderingContext;
		program: WebGLProgram | null = null;
		uniformLocations: Record<string, WebGLUniformLocation | null> = {};
		fragmentShader: string;
		rafId: number | null = null;
		lastFrameTime = 0;
		totalAnimationTime = 0;
		externalSpeed = 1;
		effectiveSpeed = 1;
		isPageVisible = true;
		isReducedMotion = false;
		providedUniforms: Record<string, number | number[] | boolean>;
		hasBeenDisposed = false;
		resolutionChanged = true;
		resizeObserver: ResizeObserver | null = null;
		resizeRafId: number | null = null;
		resizeTimeoutId: number | null = null;
		resizeSettleTimeoutId: number | null = null;
		observedCssWidth = 0;
		observedCssHeight = 0;
		pendingForceResize = false;
		lastResizeCommitAt = 0;
		// High-water-mark resolution used for UV coordinate calculation in the shader.
		// Only ever grows — never shrinks — so the pattern stays visually stable
		// while the hero container morphs from full-screen to pill and back.
		referenceWidth = 0;
		referenceHeight = 0;

		constructor(
			canvas: HTMLCanvasElement,
			fragmentShader: string,
			uniforms: Record<string, number | number[] | boolean> = {},
			webGlContextAttributes?: WebGLContextAttributes,
			speed = 1,
			seed = 0
		) {
			this.canvas = canvas;
			this.fragmentShader = fragmentShader;
			this.providedUniforms = uniforms;
			this.totalAnimationTime = seed;

			const gl = canvas.getContext('webgl2', webGlContextAttributes);
			if (!gl) {
				throw new Error('WebGL2 not supported');
			}
			this.gl = gl;

			this.initWebGL();
			this.setupResizeObserver();
			this.setupIntersectionObserver();
			this.setSpeed(speed);
		}

		initWebGL = () => {
			const program = this.createProgram(vertexShaderSource, this.fragmentShader);
			if (!program) return;
			this.program = program;
			this.setupPositionAttribute();
			this.setupUniforms();
		};

		createShader = (type: number, source: string): WebGLShader | null => {
			const shader = this.gl.createShader(type);
			if (!shader) return null;
			this.gl.shaderSource(shader, source);
			this.gl.compileShader(shader);
			if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
				console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
				this.gl.deleteShader(shader);
				return null;
			}
			return shader;
		};

		createProgram = (vertexSource: string, fragmentSource: string): WebGLProgram | null => {
			const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
			const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
			if (!vertexShader || !fragmentShader) return null;

			const program = this.gl.createProgram();
			if (!program) return null;

			this.gl.attachShader(program, vertexShader);
			this.gl.attachShader(program, fragmentShader);
			this.gl.linkProgram(program);

			if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
				console.error('Program link error:', this.gl.getProgramInfoLog(program));
				this.gl.deleteProgram(program);
				return null;
			}

			this.gl.detachShader(program, vertexShader);
			this.gl.detachShader(program, fragmentShader);
			this.gl.deleteShader(vertexShader);
			this.gl.deleteShader(fragmentShader);

			return program;
		};

		setupPositionAttribute = () => {
			const positionAttributeLocation = this.gl.getAttribLocation(this.program!, 'a_position');
			const positionBuffer = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
			const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
			this.gl.enableVertexAttribArray(positionAttributeLocation);
			this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
		};

		setupUniforms = () => {
			this.uniformLocations = {
				u_time: this.gl.getUniformLocation(this.program!, 'u_time'),
				u_pixelRatio: this.gl.getUniformLocation(this.program!, 'u_pixelRatio'),
				u_resolution: this.gl.getUniformLocation(this.program!, 'u_resolution'),
				...Object.fromEntries(
					Object.keys(this.providedUniforms).map((key) => [
						key,
						this.gl.getUniformLocation(this.program!, key)
					])
				)
			};
		};

		intersectionObserver: IntersectionObserver | null = null;
		isVisible = true;

		canAnimate = () => {
			return (
				!this.hasBeenDisposed &&
				this.isVisible &&
				this.isPageVisible &&
				!this.isReducedMotion &&
				this.externalSpeed !== 0
			);
		};

		applyAnimationState = () => {
			this.effectiveSpeed = this.canAnimate() ? this.externalSpeed : 0;

			if (this.effectiveSpeed !== 0) {
				if (this.rafId === null) {
					const now = performance.now();
					this.lastFrameTime = now;
					this.rafId = requestAnimationFrame(this.render);
				}
				return;
			}

			if (this.rafId !== null) {
				cancelAnimationFrame(this.rafId);
				this.rafId = null;
			}
		};

		scheduleResize = (force = false) => {
			if (this.hasBeenDisposed) return;

			if (force) {
				this.pendingForceResize = true;
			}

			if (this.resizeRafId !== null) return;

			this.resizeRafId = requestAnimationFrame(() => {
				this.resizeRafId = null;

				const shouldForce = this.pendingForceResize;
				this.pendingForceResize = false;

				const elapsed = performance.now() - this.lastResizeCommitAt;
				if (!shouldForce && elapsed < RESIZE_THROTTLE_MS) {
					if (this.resizeTimeoutId !== null) {
						window.clearTimeout(this.resizeTimeoutId);
					}

					this.resizeTimeoutId = window.setTimeout(() => {
						this.resizeTimeoutId = null;
						this.scheduleResize(false);
					}, RESIZE_THROTTLE_MS - elapsed);
					return;
				}

				this.handleResize(shouldForce);
				this.lastResizeCommitAt = performance.now();
			});
		};

		setupResizeObserver = () => {
			this.resizeObserver = new ResizeObserver((entries) => {
				const entry = entries[0];
				if (entry) {
					const nextWidth = Math.round(entry.contentRect.width);
					const nextHeight = Math.round(entry.contentRect.height);
					if (
						nextWidth !== this.observedCssWidth ||
						nextHeight !== this.observedCssHeight
					) {
						this.observedCssWidth = nextWidth;
						this.observedCssHeight = nextHeight;
					}
				}

				if (this.resizeSettleTimeoutId !== null) {
					window.clearTimeout(this.resizeSettleTimeoutId);
				}
				this.resizeSettleTimeoutId = window.setTimeout(() => {
					this.resizeSettleTimeoutId = null;
					this.scheduleResize(true);
				}, RESIZE_SETTLE_MS);

				this.scheduleResize(false);
			});

			const resizeTarget = this.canvas.parentElement ?? this.canvas;
			this.resizeObserver.observe(resizeTarget);
			this.handleResize(true);
		};

		setupIntersectionObserver = () => {
			this.intersectionObserver = new IntersectionObserver(
				(entries) => {
					const entry = entries[0];
					this.isVisible = entry?.isIntersecting ?? true;
					this.applyAnimationState();
				},
				{ threshold: 0 }
			);
			this.intersectionObserver.observe(this.canvas);
		};

		handleResize = (force = false) => {
			const measuredWidth =
				this.observedCssWidth || Math.round(this.canvas.getBoundingClientRect().width);
			const measuredHeight =
				this.observedCssHeight || Math.round(this.canvas.getBoundingClientRect().height);

			if (!measuredWidth || !measuredHeight) return;

			const cssWidth = force
				? measuredWidth
				: Math.max(1, Math.round(measuredWidth / RESIZE_QUANTUM_PX) * RESIZE_QUANTUM_PX);
			const cssHeight = force
				? measuredHeight
				: Math.max(1, Math.round(measuredHeight / RESIZE_QUANTUM_PX) * RESIZE_QUANTUM_PX);

			const pixelRatio = window.devicePixelRatio || 1;
			let newWidth = Math.max(1, Math.floor(cssWidth * pixelRatio));
			let newHeight = Math.max(1, Math.floor(cssHeight * pixelRatio));

			if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
				this.canvas.width = newWidth;
				this.canvas.height = newHeight;
				this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

				// Only update the UV reference resolution when the canvas grows.
				// During the hero morph the container shrinks, but we keep u_resolution
				// locked at the full-screen high-water mark so the pattern appears
				// stable — the shrinking canvas just clips the same fixed pattern
				// rather than recomputing UVs and causing a visible jump/jitter.
				if (newWidth > this.referenceWidth || newHeight > this.referenceHeight) {
					this.referenceWidth = Math.max(this.referenceWidth, newWidth);
					this.referenceHeight = Math.max(this.referenceHeight, newHeight);
					this.resolutionChanged = true;
				}

				// Force synchronous render to prevent flickering when canvas is cleared
				this.render(performance.now(), true);
			}
		};

		render = (currentTime: number, forceDraw = false) => {
			if (this.hasBeenDisposed) return;
			
			// If called manually (e.g. forceDraw), cancel any pending scheduled frames 
			// to avoid spawning multiple concurrent rAF loops.
			if (this.rafId !== null && forceDraw) {
				cancelAnimationFrame(this.rafId);
			}
			this.rafId = null;
			
			const canAnimateNow = this.canAnimate() && this.effectiveSpeed !== 0;
			
			if (!canAnimateNow && !forceDraw) {
				return;
			}

			if (this.lastFrameTime === 0) {
				this.lastFrameTime = currentTime;
			}

			const dt = Math.max(0, currentTime - this.lastFrameTime);
			this.lastFrameTime = currentTime;

			if (canAnimateNow) {
				this.totalAnimationTime += dt * this.effectiveSpeed;
			}

			this.gl.clear(this.gl.COLOR_BUFFER_BIT);
			this.gl.useProgram(this.program);

			this.gl.uniform1f(this.uniformLocations.u_time!, this.totalAnimationTime * 0.001);

			if (this.resolutionChanged) {
				// Use the stable reference resolution (high-water mark), not the current
				// canvas size, so the UV mapping doesn't shift during hero morph shrink.
				this.gl.uniform2f(
					this.uniformLocations.u_resolution!,
					this.referenceWidth,
					this.referenceHeight
				);
				this.gl.uniform1f(
					this.uniformLocations.u_pixelRatio!,
					window.devicePixelRatio || 1
				);
				this.resolutionChanged = false;
			}

			this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

			if (canAnimateNow) {
				this.requestRender();
			} else {
				this.rafId = null;
			}
		};

		requestRender = () => {
			if (this.rafId === null) {
				this.rafId = requestAnimationFrame(this.render);
			}
		};

		updateProvidedUniforms = () => {
			this.gl.useProgram(this.program);
			Object.entries(this.providedUniforms).forEach(([key, value]) => {
				const location = this.uniformLocations[key];
				if (location) {
					if (Array.isArray(value)) {
						switch (value.length) {
							case 2:
								this.gl.uniform2fv(location, value);
								break;
							case 3:
								this.gl.uniform3fv(location, value);
								break;
							case 4:
								this.gl.uniform4fv(location, value);
								break;
						}
					} else if (typeof value === 'number') {
						this.gl.uniform1f(location, value);
					} else if (typeof value === 'boolean') {
						this.gl.uniform1i(location, value ? 1 : 0);
					}
				}
			});
		};

		setSeed = (newSeed: number) => {
			const oneFrameAt120Fps = 1000 / 120;
			this.totalAnimationTime = newSeed * oneFrameAt120Fps;
			this.lastFrameTime = performance.now();
			this.render(performance.now(), true);
		};

		setSpeed = (newSpeed = 1) => {
			this.externalSpeed = newSpeed;
			this.applyAnimationState();
		};

		setPageVisibility = (isVisible: boolean) => {
			this.isPageVisible = isVisible;
			this.applyAnimationState();
		};

		setReducedMotion = (enabled: boolean) => {
			this.isReducedMotion = enabled;
			this.applyAnimationState();
		};

		setUniforms = (newUniforms: Record<string, number | number[] | boolean>) => {
			this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
			this.updateProvidedUniforms();
			if (!this.canAnimate() || this.effectiveSpeed === 0) {
				this.render(performance.now(), true);
			} else {
				this.requestRender();
			}
		};

		dispose = () => {
			this.hasBeenDisposed = true;
			if (this.resizeRafId !== null) {
				cancelAnimationFrame(this.resizeRafId);
				this.resizeRafId = null;
			}
			if (this.resizeTimeoutId !== null) {
				window.clearTimeout(this.resizeTimeoutId);
				this.resizeTimeoutId = null;
			}
			if (this.resizeSettleTimeoutId !== null) {
				window.clearTimeout(this.resizeSettleTimeoutId);
				this.resizeSettleTimeoutId = null;
			}
			if (this.rafId !== null) {
				cancelAnimationFrame(this.rafId);
				this.rafId = null;
			}
			if (this.gl && this.program) {
				this.gl.deleteProgram(this.program);
				this.program = null;
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
				this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
				this.gl.getError();
			}
			if (this.resizeObserver) {
				this.resizeObserver.disconnect();
				this.resizeObserver = null;
			}
			if (this.intersectionObserver) {
				this.intersectionObserver.disconnect();
				this.intersectionObserver = null;
			}
			this.uniformLocations = {};
		};
	}

	onMount(() => {
		if (!canvas) return;

		const uniforms = {
			u_scale: plasmaConfig.scale,
			u_rotation: (plasmaConfig.rotation * Math.PI) / 180,
			u_color1: getShaderColorFromString(color1),
			u_color2: getShaderColorFromString(color2),
			u_color3: getShaderColorFromString(color3),
			u_proportion: plasmaConfig.proportion / 100,
			u_softness: plasmaConfig.softness / 100,
			u_distortion: plasmaConfig.distortion / 50,
			u_swirl: plasmaConfig.swirl / 100,
			u_swirlIterations: plasmaConfig.swirl === 0 ? 0 : plasmaConfig.swirlIterations,
			u_shapeScale: plasmaConfig.shapeSize / 100,
			u_shape: PatternShapes.Checks
		};

		try {
			shaderMount = new ShaderMount(
				canvas,
				warpFragmentShader,
				uniforms,
				{
					alpha: true,
					antialias: false,
					depth: false,
					stencil: false,
					premultipliedAlpha: true,
					preserveDrawingBuffer: false,
					powerPreference: 'low-power'
				},
				animationSpeed,
				plasmaConfig.offset * 10
			);

			const updateVisibility = () => shaderMount?.setPageVisibility(!document.hidden);
			visibilityListener = updateVisibility;
			document.addEventListener('visibilitychange', updateVisibility, { passive: true });
			updateVisibility();

			motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			reducedMotionListener = (event: MediaQueryListEvent) => {
				shaderMount?.setReducedMotion(event.matches);
			};
			motionQuery.addEventListener('change', reducedMotionListener);
			shaderMount.setReducedMotion(motionQuery.matches);
		} catch (e) {
			console.error('Failed to initialize shader:', e);
		}

		return () => {
			if (visibilityListener) {
				document.removeEventListener('visibilitychange', visibilityListener);
				visibilityListener = null;
			}

			if (motionQuery && reducedMotionListener) {
				motionQuery.removeEventListener('change', reducedMotionListener);
			}
			reducedMotionListener = null;
			motionQuery = null;
		};
	});

	$effect(() => {
		if (shaderMount) {
			shaderMount.setUniforms({
				u_color1: getShaderColorFromString(color1),
				u_color2: getShaderColorFromString(color2),
				u_color3: getShaderColorFromString(color3)
			});
		}
	});

	$effect(() => {
		if (shaderMount) {
			shaderMount.setSpeed(animationSpeed);
		}
	});

	onDestroy(() => {
		shaderMount?.dispose();
	});
</script>

<canvas bind:this={canvas} class="pointer-events-none absolute inset-0 h-full w-full {className}"
></canvas>
