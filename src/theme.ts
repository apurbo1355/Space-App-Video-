import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const inter = loadInter('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['400', '500', '700'], subsets: ['latin']});

export const FONT = {
	sans: `${inter.fontFamily}, system-ui, sans-serif`,
	mono: `${mono.fontFamily}, ui-monospace, monospace`,
};

export const COLOR = {
	bg: '#090D16',
	cyan: '#38BDF8',
	amber: '#F59E0B',
	crimson: '#EF4444',
	/** Positive fire margin ("puts itself out"). */
	safe: '#22C55E',
	grid: '#1E293B',
	text: '#E2E8F0',
	/** Text at reduced emphasis (same hue as text). */
	textDim: 'rgba(226, 232, 240, 0.62)',
	panel: 'rgba(15, 23, 42, 0.72)',
};

/** Smallest font size used anywhere in the video. */
export const MIN_FONT = 28;
