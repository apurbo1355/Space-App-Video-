import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {fade, fadeOut} from '../anim';
import {COLOR, FONT} from '../theme';

const Grid: React.FC = () => (
	<svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
		<defs>
			<pattern id="grid-minor" width="40" height="40" patternUnits="userSpaceOnUse">
				<path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLOR.grid} strokeWidth="1" opacity="0.35" />
			</pattern>
			<pattern id="grid-major" width="160" height="160" patternUnits="userSpaceOnUse">
				<rect width="160" height="160" fill="url(#grid-minor)" />
				<path d="M 160 0 L 0 0 0 160" fill="none" stroke={COLOR.grid} strokeWidth="1.5" opacity="0.8" />
			</pattern>
			<radialGradient id="vignette" cx="50%" cy="45%" r="75%">
				<stop offset="55%" stopColor={COLOR.bg} stopOpacity="0" />
				<stop offset="100%" stopColor={COLOR.bg} stopOpacity="0.9" />
			</radialGradient>
		</defs>
		<rect width="100%" height="100%" fill="url(#grid-major)" />
		<rect width="100%" height="100%" fill="url(#vignette)" />
	</svg>
);

const Corners: React.FC = () => {
	const c = 'rgba(56, 189, 248, 0.45)';
	const L = 28;
	const m = 32;
	const s = {position: 'absolute' as const, width: L, height: L};
	return (
		<>
			<div style={{...s, left: m, top: m, borderLeft: `2px solid ${c}`, borderTop: `2px solid ${c}`}} />
			<div style={{...s, right: m, top: m, borderRight: `2px solid ${c}`, borderTop: `2px solid ${c}`}} />
			<div style={{...s, left: m, bottom: m, borderLeft: `2px solid ${c}`, borderBottom: `2px solid ${c}`}} />
			<div style={{...s, right: m, bottom: m, borderRight: `2px solid ${c}`, borderBottom: `2px solid ${c}`}} />
		</>
	);
};

/**
 * Shared scene chrome: dark HUD background, grid, scene label and brand.
 * Content fades in at the start and out at the end of each scene.
 */
export const HudFrame: React.FC<{
	index: number;
	title: string;
	children: React.ReactNode;
	fadeOutAtEnd?: boolean;
}> = ({index, title, children, fadeOutAtEnd = true}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const opacity = fade(frame, 0, 14) * (fadeOutAtEnd ? fadeOut(frame, durationInFrames, 12) : 1);
	return (
		<AbsoluteFill style={{backgroundColor: COLOR.bg, color: COLOR.text, fontFamily: FONT.sans}}>
			<Grid />
			<Corners />
			<AbsoluteFill style={{opacity}}>
				<div
					style={{
						position: 'absolute',
						left: 80,
						top: 52,
						display: 'flex',
						alignItems: 'center',
						gap: 18,
						fontSize: 28,
						letterSpacing: '0.14em',
					}}
				>
					<span style={{fontFamily: FONT.mono, color: COLOR.cyan}}>{String(index).padStart(2, '0')}</span>
					<span style={{width: 40, height: 2, background: 'rgba(56,189,248,0.6)'}} />
					<span style={{fontWeight: 600, textTransform: 'uppercase'}}>{title}</span>
				</div>
				<div
					style={{
						position: 'absolute',
						right: 80,
						top: 52,
						fontFamily: FONT.mono,
						fontSize: 28,
						letterSpacing: '0.12em',
						color: COLOR.textDim,
					}}
				>
					ASTRAFLAME
				</div>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
