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
		scale: 0.75,
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

	const PatternShapes = { Checks: 0, Stripes: 1, Edge: 2 };

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

		let r: number, g: number, b: number, a = 1;

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
			const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
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
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

out vec4 fragColor;

#define PI 3.14159265358979323846
#define TWO_PI 6.28318530717958647692

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
    vec3 color1 = c1.rgb * c1.a;
    vec3 color2 = c2.rgb * c2.a;
    vec3 color3 = c3.rgb * c3.a;

    float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);
    float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);

    vec3 blended_color_2 = mix(color1, color2, r1);
    float blended_opacity_2 = mix(c1.a, c2.a, r1);

    vec3 c = mix(blended_color_2, color3, r2);
    float o = mix(blended_opacity_2, c3.a, r2);
    return vec4(c, o);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv_original = uv;

    float t = .5 * u_time;

    float noise_scale = .0005 + .006 * u_scale;

    uv -= .5;
    uv *= (noise_scale * u_resolution);
    uv = rotate(uv, u_rotation * .5 * PI);
    uv /= u_pixelRatio;
    uv += .5;

    float n1 = noise(uv * 1. + t);
    float n2 = noise(uv * 2. - t);
    float angle = n1 * TWO_PI;
    uv.x += 4. * u_distortion * n2 * cos(angle);
    uv.y += 4. * u_distortion * n2 * sin(angle);

    float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
    for (float i = 1.; i <= iterations_number; i++) {
        uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
        uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);
    }

    float proportion = clamp(u_proportion, 0., 1.);

    float shape = 0.;
    float mixer = 0.;
    if (u_shape < .5) {
      vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);
      shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else if (u_shape < 1.5) {
      vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);
      float f = fract(stripes_shape_uv.y);
      shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else {
      float sh = 1. - uv.y;
      sh -= .5;
      sh /= (noise_scale * u_resolution.y);
      sh += .5;
      float shape_scaling = .2 * (1. - u_shapeScale);
      shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
      mixer = shape;
    }

    vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);

    fragColor = vec4(color_mix.rgb, color_mix.a);
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
		speed = 1;
		providedUniforms: Record<string, number | number[] | boolean>;
		hasBeenDisposed = false;
		resolutionChanged = true;
		resizeObserver: ResizeObserver | null = null;

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

		setupResizeObserver = () => {
			this.resizeObserver = new ResizeObserver(() => this.handleResize());
			this.resizeObserver.observe(this.canvas);
			this.handleResize();
		};

		handleResize = () => {
			const pixelRatio = window.devicePixelRatio;
			const newWidth = this.canvas.clientWidth * pixelRatio;
			const newHeight = this.canvas.clientHeight * pixelRatio;

			if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
				this.canvas.width = newWidth;
				this.canvas.height = newHeight;
				this.resolutionChanged = true;
				this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
				this.render(performance.now());
			}
		};

		render = (currentTime: number) => {
			if (this.hasBeenDisposed) return;

			const dt = currentTime - this.lastFrameTime;
			this.lastFrameTime = currentTime;

			if (this.speed !== 0) {
				this.totalAnimationTime += dt * this.speed;
			}

			this.gl.clear(this.gl.COLOR_BUFFER_BIT);
			this.gl.useProgram(this.program);

			this.gl.uniform1f(this.uniformLocations.u_time!, this.totalAnimationTime * 0.001);

			if (this.resolutionChanged) {
				this.gl.uniform2f(
					this.uniformLocations.u_resolution!,
					this.gl.canvas.width,
					this.gl.canvas.height
				);
				this.gl.uniform1f(this.uniformLocations.u_pixelRatio!, window.devicePixelRatio);
				this.resolutionChanged = false;
			}

			this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

			if (this.speed !== 0) {
				this.requestRender();
			} else {
				this.rafId = null;
			}
		};

		requestRender = () => {
			if (this.rafId !== null) {
				cancelAnimationFrame(this.rafId);
			}
			this.rafId = requestAnimationFrame(this.render);
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
			this.render(performance.now());
		};

		setSpeed = (newSpeed = 1) => {
			this.speed = newSpeed;
			if (this.rafId === null && newSpeed !== 0) {
				this.lastFrameTime = performance.now();
				this.rafId = requestAnimationFrame(this.render);
			}
			if (this.rafId !== null && newSpeed === 0) {
				cancelAnimationFrame(this.rafId);
				this.rafId = null;
			}
		};

		setUniforms = (newUniforms: Record<string, number | number[] | boolean>) => {
			this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
			this.updateProvidedUniforms();
			this.render(performance.now());
		};

		dispose = () => {
			this.hasBeenDisposed = true;
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
				undefined,
				animationSpeed,
				plasmaConfig.offset * 10
			);
		} catch (e) {
			console.error('Failed to initialize shader:', e);
		}
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
