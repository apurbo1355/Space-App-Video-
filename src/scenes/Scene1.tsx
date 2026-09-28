import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, fade, lerp} from '../anim';
import {HudFrame} from '../components/HudFrame';
import {SourceChips} from '../components/SourceChip';
import {cueFrom} from '../config';
import {EARTH_AIR, EXPLORATION_AIR, SOURCES} from '../data/facts';
import {COLOR, FONT} from '../theme';
import {Voiceover} from '../voiceover/Voiceover';

const S = 'Scene1' as const;

const PANEL_W = 800;
const BAR_W = 720;

type Metric = {key: 'pressure' | 'o2' | 'pp'; label: string; max: number; fmt: (v: number) => string};
const METRICS: Metric[] = [
	{key: 'pressure', label: 'Total pressure', max: 16, fmt: (v) => `${v} psia`},
	{key: 'o2', label: 'Oxygen %', max: 40, fmt: (v) => `${v}% O₂`},
	{key: 'pp', label: 'O₂ partial pressure', max: 4, fmt: (v) => `≈ ${v} psia`},
];

const valueOf = (air: typeof EARTH_AIR | typeof EXPLORATION_AIR, key: Metric['key']) =>
	key === 'pressure' ? air.pressurePsia : key === 'o2' ? air.o2Pct : air.ppO2Psia;

const DELTA: Record<Metric['key'], string> = {pressure: '▼ less', o2: '▲ higher', pp: '≈ similar'};

const Bar: React.FC<{
	metric: Metric;
	value: number;
	fill: number;
	valueOpacity: number;
	ghost?: number;
	ghostOpacity?: number;
	delta?: string;
	deltaOpacity?: number;
	color: string;
}> = ({metric, value, fill, valueOpacity, ghost, ghostOpacity = 0, delta, deltaOpacity = 0, color}) => (
	<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
			<span style={{fontSize: 30, color: COLOR.textDim}}>{metric.label}</span>
			<span style={{display: 'flex', gap: 18, alignItems: 'baseline'}}>
				{delta ? (
					<span style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.textDim, opacity: deltaOpacity}}>{delta}</span>
				) : null}
				<span style={{fontFamily: FONT.mono, fontSize: 38, fontWeight: 700, color, opacity: valueOpacity}}>
					{metric.fmt(value)}
				</span>
			</span>
		</div>
		<div style={{position: 'relative', width: BAR_W, height: 30, borderRadius: 6, background: 'rgba(30, 41, 59, 0.8)'}}>
			{ghost !== undefined ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: -5,
						width: (ghost / metric.max) * BAR_W,
						height: 40,
						borderRadius: 7,
						border: `2px dashed ${COLOR.textDim}`,
						opacity: ghostOpacity,
					}}
				/>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: fill * BAR_W,
					height: 30,
					borderRadius: 6,
					background: color,
					boxShadow: `0 0 18px ${color}66`,
				}}
			/>
		</div>
	</div>
);

const Panel: React.FC<{x: number; title: string; spec: string; opacity: number; children: React.ReactNode; accent: string}> = ({
	x,
	title,
	spec,
	opacity,
	children,
	accent,
}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: 225,
			width: PANEL_W,
			height: 530,
			padding: '30px 40px',
			boxSizing: 'border-box',
			borderRadius: 16,
			border: `1.5px solid ${COLOR.grid}`,
			background: COLOR.panel,
			opacity,
			display: 'flex',
			flexDirection: 'column',
			gap: 30,
		}}
	>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
			<span style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.04em', color: accent}}>{title}</span>
			<span style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.textDim}}>{spec}</span>
		</div>
		{children}
	</div>
);

export const Scene1: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tB = cueFrom(S, 's1b');
	const tC = cueFrom(S, 's1c');

	const earthIn = (i: number) => ease(frame, fps, 45 + i * 12, 40);
	const morph = (i: number) => ease(frame, fps, tB + 15 + i * 30, 45);
	const line1At = tB + 135;

	return (
		<HudFrame index={1} title="The Air Is Changing">
			<div
				style={{
					position: 'absolute',
					top: 118,
					width: '100%',
					textAlign: 'center',
					fontSize: 56,
					fontWeight: 700,
					letterSpacing: '-0.01em',
					opacity: fade(frame, 10, 20),
				}}
			>
				Fire safety in <span style={{color: COLOR.cyan}}>NASA's planned exploration atmosphere</span>
			</div>

			<Panel x={120} title="EARTH" spec="sea level" opacity={fade(frame, 30, 18)} accent={COLOR.text}>
				{METRICS.map((m, i) => (
					<Bar
						key={m.key}
						metric={m}
						value={valueOf(EARTH_AIR, m.key)}
						fill={(valueOf(EARTH_AIR, m.key) / m.max) * earthIn(i)}
						valueOpacity={fade(frame, 60 + i * 12, 15)}
						color={COLOR.text}
					/>
				))}
			</Panel>

			<Panel x={1000} title="EXPLORATION" spec="planned · future vehicles" opacity={fade(frame, tB - 20, 18)} accent={COLOR.cyan}>
				{METRICS.map((m, i) => {
					const e = valueOf(EARTH_AIR, m.key);
					const x = valueOf(EXPLORATION_AIR, m.key);
					const t = morph(i);
					const settled = tB + 15 + i * 30 + 40;
					return (
						<Bar
							key={m.key}
							metric={m}
							value={x}
							fill={lerp(e, x, t) / m.max}
							valueOpacity={fade(frame, settled, 15)}
							ghost={e}
							ghostOpacity={0.7 * fade(frame, tB, 15)}
							delta={DELTA[m.key]}
							deltaOpacity={fade(frame, settled + 10, 15)}
							color={COLOR.cyan}
						/>
					);
				})}
				<div style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.textDim, opacity: fade(frame, tB, 15)}}>
					dashed outline = Earth value
				</div>
			</Panel>

			<div
				style={{
					position: 'absolute',
					top: 780,
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 18,
				}}
			>
				<div style={{fontSize: 44, fontWeight: 600, opacity: fade(frame, line1At, 20)}}>
					Less pressure. Higher oxygen %. Similar oxygen to breathe.
				</div>
				<div style={{fontSize: 44, fontWeight: 700, color: COLOR.amber, opacity: fade(frame, tC, 20)}}>
					NASA tests: oxygen % drives flammability.
				</div>
			</div>

			<SourceChips chips={[{label: SOURCES.harper, from: tC}]} />
			<Voiceover sceneId={S} />
		</HudFrame>
	);
};
