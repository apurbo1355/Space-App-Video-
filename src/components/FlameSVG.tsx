import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLOR} from '../theme';

export type FlameMode = '1g' | '0g' | 'lunar';

const W = 360;
const H = 440;
const CX = W / 2;

/** Teardrop outline: round base, pointed tip that can lean by `tipDx`. */
const teardrop = (baseY: number, r: number, h: number, tipDx: number): string => {
	const tipX = CX + tipDx;
	const tipY = baseY - h;
	const y0 = baseY - r * 0.55;
	return [
		`M ${tipX} ${tipY}`,
		`C ${CX + r * 0.3 + tipDx * 0.5} ${tipY + h * 0.38}, ${CX + r * 1.05} ${y0 - r * 0.9}, ${CX + r} ${y0}`,
		`A ${r} ${r} 0 0 1 ${CX - r} ${y0}`,
		`C ${CX - r * 1.05} ${y0 - r * 0.9}, ${CX - r * 0.3 + tipDx * 0.5} ${tipY + h * 0.38}, ${tipX} ${tipY}`,
		'Z',
	].join(' ');
};

const Arrow: React.FC<{x: number; y: number; angle: number; len: number; color: string; opacity: number}> = ({
	x,
	y,
	angle,
	len,
	color,
	opacity,
}) => (
	<g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
		<line x1={0} y1={0} x2={len} y2={0} stroke={color} strokeWidth={3} strokeLinecap="round" />
		<path d={`M ${len} 0 L ${len - 11} -7 M ${len} 0 L ${len - 11} 7`} stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" />
	</g>
);

/** Bell-shaped 0→1→0 over one cycle, for looping arrows. */
const bell = (phase: number) => Math.sin(Math.PI * phase) ** 2;

export const FlameSVG: React.FC<{mode: FlameMode; size?: number; intensity?: number}> = ({mode, size = 360, intensity = 1}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const id = `flame-${mode}`;

	if (mode === '0g') {
		// Dim, blue, near-spherical diffusion flame. Oxygen diffuses inward; no plume.
		const breathe = 1 + 0.02 * Math.sin(2 * Math.PI * 0.22 * t);
		const cy = 240;
		const r = 86 * breathe;
		const arrows = Array.from({length: 8}, (_, i) => {
			const ang = (i / 8) * 360 + 22.5;
			const phase = ((frame + i * 11) % 120) / 120;
			const dist = 190 - phase * 60;
			const rad = (ang * Math.PI) / 180;
			return (
				<Arrow
					key={i}
					x={CX + Math.cos(rad) * dist}
					y={cy + Math.sin(rad) * dist}
					angle={ang + 180}
					len={34}
					color={COLOR.cyan}
					opacity={0.75 * bell(phase) * intensity}
				/>
			);
		});
		return (
			<svg width={size} height={(size / W) * H} viewBox={`0 0 ${W} ${H}`}>
				<defs>
					<radialGradient id={`${id}-g`} cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor={COLOR.cyan} stopOpacity={0.05} />
						<stop offset="62%" stopColor={COLOR.cyan} stopOpacity={0.18} />
						<stop offset="88%" stopColor={COLOR.cyan} stopOpacity={0.55} />
						<stop offset="100%" stopColor={COLOR.cyan} stopOpacity={0} />
					</radialGradient>
					<filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="10" />
					</filter>
				</defs>
				<circle cx={CX} cy={cy} r={r * 1.15} fill={COLOR.cyan} opacity={0.1 * intensity} filter={`url(#${id}-blur)`} />
				<circle cx={CX} cy={cy} r={r} fill={`url(#${id}-g)`} opacity={intensity} />
				<circle cx={CX} cy={cy} r={r * 0.9} fill="none" stroke={COLOR.cyan} strokeOpacity={0.35 * intensity} strokeWidth={2} />
				<circle cx={CX} cy={cy} r={10} fill={COLOR.text} opacity={0.35 * intensity} />
				{arrows}
			</svg>
		);
	}

	const isLunar = mode === 'lunar';
	const baseY = 360;
	const r = isLunar ? 74 : 62;
	const hBase = isLunar ? 175 : 225;
	// Gentle flicker (1 g) or slow sway (lunar). No shake: low amplitude, smooth sines.
	const amp = isLunar ? 0.025 : 0.055;
	const speed = isLunar ? 0.6 : 1.5;
	const h = hBase * (1 + amp * Math.sin(2 * Math.PI * speed * t) + amp * 0.6 * Math.sin(2 * Math.PI * speed * 1.7 * t + 1.3));
	const tipDx = (isLunar ? 3 : 7) * Math.sin(2 * Math.PI * speed * 0.55 * t + 0.4);
	const tipY = baseY - h;

	const plumeXs = isLunar ? [CX] : [CX - 56, CX, CX + 56];
	const period = isLunar ? 130 : 70;
	const travel = isLunar ? 55 : 70;
	const plume = plumeXs.map((x, i) => {
		const phase = ((frame + i * (period / 3)) % period) / period;
		return (
			<Arrow
				key={i}
				x={x}
				y={tipY - 12 - phase * travel}
				angle={-90}
				len={isLunar ? 32 : 42}
				color={isLunar ? COLOR.amber : COLOR.text}
				opacity={(isLunar ? 0.5 : 0.7) * bell(phase) * intensity}
			/>
		);
	});

	const bodyOpacity = (isLunar ? 0.72 : 1) * intensity;
	return (
		<svg width={size} height={(size / W) * H} viewBox={`0 0 ${W} ${H}`}>
			<defs>
				<linearGradient id={`${id}-outer`} x1="0" y1="1" x2="0" y2="0">
					<stop offset="0%" stopColor={COLOR.crimson} />
					<stop offset="45%" stopColor={COLOR.amber} />
					<stop offset="100%" stopColor={COLOR.amber} stopOpacity={0.35} />
				</linearGradient>
				<linearGradient id={`${id}-inner`} x1="0" y1="1" x2="0" y2="0">
					<stop offset="0%" stopColor="#FEF3C7" />
					<stop offset="100%" stopColor={COLOR.amber} stopOpacity={0.6} />
				</linearGradient>
				<filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="14" />
				</filter>
			</defs>
			<path d={teardrop(baseY, r * 1.2, h * 1.08, tipDx)} fill={COLOR.amber} opacity={0.22 * bodyOpacity} filter={`url(#${id}-blur)`} />
			<path d={teardrop(baseY, r, h, tipDx)} fill={`url(#${id}-outer)`} opacity={0.9 * bodyOpacity} />
			<path d={teardrop(baseY - 4, r * 0.55, h * 0.62, tipDx * 0.7)} fill={`url(#${id}-inner)`} opacity={0.85 * bodyOpacity} />
			{/* blue base zone */}
			<ellipse cx={CX} cy={baseY + r * 0.28} rx={r * 0.62} ry={r * 0.18} fill={COLOR.cyan} opacity={0.45 * bodyOpacity} />
			{/* wick / fuel */}
			<rect x={CX - 3} y={baseY + r * 0.35} width={6} height={40} rx={3} fill={COLOR.textDim} />
			{plume}
		</svg>
	);
};
