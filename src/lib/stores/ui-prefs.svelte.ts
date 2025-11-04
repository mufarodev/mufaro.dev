class UiPreferences {
	reducedMotion = $state(false);
	noiseIntensity = $state(0.09);
	themeWarmth = $state('amber-slight');
	activeSection = $state('hero');
	selectedProject = $state<string | null>(null);

	constructor() {
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			this.reducedMotion = mediaQuery.matches;

			mediaQuery.addEventListener('change', (e) => {
				this.reducedMotion = e.matches;
			});

			const savedNoiseIntensity = localStorage.getItem('noiseIntensity');
			if (savedNoiseIntensity) {
				this.noiseIntensity = parseFloat(savedNoiseIntensity);
			}
		}
	}

	setNoiseIntensity(value: number) {
		this.noiseIntensity = value;
		if (typeof window !== 'undefined') {
			localStorage.setItem('noiseIntensity', value.toString());
		}
	}

	toggleMotion() {
		this.reducedMotion = !this.reducedMotion;
	}

	setActiveSection(section: string) {
		this.activeSection = section;
	}

	openProject(projectId: string) {
		this.selectedProject = projectId;
	}

	closeProject() {
		this.selectedProject = null;
	}
}

export const uiPrefs = new UiPreferences();
