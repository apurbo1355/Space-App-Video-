import {interpolate, spring} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 → 1 linear-eased fade starting at `start`. */
export const fade = (frame: number, start: number, duration = 18): number =>
	interpolate(frame, [start, start + duration], [0, 1], clamp);

/** 1 → 0 fade ending at `end`. */
export const fadeOut = (frame: number, end: number, duration = 15): number =>
	interpolate(frame, [end - duration, end], [1, 0], clamp);

/** Calm spring (no overshoot) starting at `start`. */
export const ease = (frame: number, fps: number, start: number, durationInFrames = 30): number =>
	spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames});

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const range = (frame: number, input: [number, number], output: [number, number]): number =>
	interpolate(frame, input, output, clamp);
