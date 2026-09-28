import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, fade, fadeOut, range} from '../anim';
import {Badge} from '../components/Badge';
import {FlameSVG, FlameMode} from '../components/FlameSVG';
import {HudFrame} from '../components/HudFrame';
import {SourceChips} from '../components/SourceChip';
import {cueFrom} from '../config';
import {SOURCES} from '../data/facts';
import {COLOR, FONT} from '../theme';
import {Voiceover} from '../voiceover/Voiceover';

const S = 'Scene2' as const;

const FlamePanel: React.FC<{
	mode: FlameMode;
	cx: number;
	at: number;
	title: string;
	caption: string;
	extra?: React.ReactNode;
}> = ({mode, cx, at, title, caption, extra}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const k = ease(frame, fps, at, 36);
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - 250,
				top: 170,
				width: 500,
				opacity: k,
				transform: `translateY(${(1 - k) * 24}px)`,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					width: 440,
					height: 470,
					borderRadius: 16,
					border: `1.5px solid ${COLOR.grid}`,
					background: 'rgba(15, 23, 42, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<FlameSVG mode={mode} size={360} />
			</div>
			<div style={{marginTop: 26, fontSize: 40, fontWeight: 700}}>{title}</div>
			<div style={{marginTop: 8, fontSize: 30, color: COLOR.textDim}}>{caption}</div>
			{extra}
		</div>
	);
};

// ---- Conceptual flammability map (after Olson, NASA Glenn; thin fuels) ----
const CH = {x: 110, y: 250, w: 1700, h: 600};
const AX = {left: 110, right: 1600, top: 30, bottom: 520};
const U0 = 0.068;
const U1 = 0.98;
/** Unitless U-shape: steep quenching wall on the left, blowoff rise on the right. */
const f = (u: number) => Math.min(1.1, 0.2 + 0.035 / (u - 0.02) + 1.6 * (u - 0.35) ** 2);
const px = (u: number) => AX.left + ((u - U0) / (U1 - U0)) * (AX.right - AX.left);
const py = (v: number) => AX.bottom - v * (AX.bottom - AX.top) * 0.88;

const curvePath = (() => {
	const pts: string[] = [];
	for (let i = 0; i <= 160; i++) {
		const u = U0 + ((U1 - U0) * i) / 160;
		pts.push(`${i === 0 ? 'M' : 'L'} ${px(u).toFixed(1)} ${py(f(u)).toFixed(1)}`);
	}
	return pts.join(' ');
})();

const FlammabilityMap: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const draw = ease(frame, fps, at + 10, 50);
	const dotT = range(frame, [at + 70, at + 250], [0, 1]);
	// ease-in-out along the axis
	const u = U0 + 0.03 + (U1 - U0 - 0.06) * (0.5 - 0.5 * Math.cos(Math.PI * dotT));
	const dotX = px(u);
	const dotY = py(f(u));
	const len = 2600;
	const labelIn = (d: number) => fade(frame, at + d, 18);

	return (
		<div style={{position: 'absolute', left: CH.x, top: CH.y, width: CH.w, height: CH.h, opacity: fade(frame, at, 18)}}>
			<svg width={CH.w} height={CH.h} style={{overflow: 'visible'}}>
				<defs>
					<clipPath id="above-curve">
						<path d={`${curvePath} L ${px(U1)} ${AX.top - 20} L ${px(U0)} ${AX.top - 20} Z`} />
					</clipPath>
				</defs>
				{/* burn region (above the limit curve) */}
				<rect
					x={AX.left}
					y={AX.top - 20}
					width={AX.right - AX.left}
					height={AX.bottom - AX.top}
					fill={COLOR.crimson}
					opacity={0.08 * draw}
					clipPath="url(#above-curve)"
				/>
				{/* axes (no numbers: conceptual) */}
				<line x1={AX.left} y1={AX.bottom} x2={AX.right + 40} y2={AX.bottom} stroke={COLOR.textDim} strokeWidth={2} />
				<line x1={AX.left} y1={AX.bottom} x2={AX.left} y2={AX.top - 30} stroke={COLOR.textDim} strokeWidth={2} />
				<path d={`M ${AX.right + 40} ${AX.bottom} l -14 -8 m 14 8 l -14 8`} stroke={COLOR.textDim} strokeWidth={2} fill="none" />
				<path d={`M ${AX.left} ${AX.top - 30} l -8 14 m 8 -14 l 8 14`} stroke={COLOR.textDim} strokeWidth={2} fill="none" />
				{/* limit curve */}
				<path d={curvePath} fill="none" stroke={COLOR.cyan} strokeWidth={10} opacity={0.15} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
				<path d={curvePath} fill="none" stroke={COLOR.cyan} strokeWidth={4} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
				{/* travelling dot */}
				<g opacity={fade(frame, at + 60, 12)}>
					<line x1={dotX} x2={dotX} y1={dotY + 14} y2={AX.bottom} stroke={COLOR.text} strokeWidth={2} strokeDasharray="6 8" opacity={0.6} />
					<circle cx={dotX} cy={AX.bottom} r={8} fill={COLOR.text} />
					<circle cx={dotX} cy={dotY} r={22} fill={COLOR.amber} opacity={0.2} />
					<circle cx={dotX} cy={dotY} r={11} fill={COLOR.amber} />
				</g>
			</svg>
			{/* axis titles */}
			<div style={{position: 'absolute', left: AX.left, top: AX.bottom + 18, width: AX.right - AX.left, textAlign: 'center', fontSize: 32, color: COLOR.text}}>
				Airflow speed →
			</div>
			<div
				style={{
					position: 'absolute',
					left: AX.left - 60,
					top: AX.bottom,
					transformOrigin: '0 0',
					transform: 'rotate(-90deg)',
					width: AX.bottom - AX.top,
					textAlign: 'center',
					fontSize: 32,
				}}
			>
				Oxygen needed to burn →
			</div>
			{/* region labels */}
			<div style={{position: 'absolute', left: px(0.075) + 30, top: py(1.02), opacity: labelIn(40)}}>
				<div style={{fontSize: 36, fontWeight: 700, color: COLOR.cyan}}>Quenching</div>
				<div style={{fontSize: 28, color: COLOR.textDim}}>too little airflow starves the flame</div>
			</div>
			<div style={{position: 'absolute', right: CH.w - px(0.97), top: py(1.1), textAlign: 'right', opacity: labelIn(60)}}>
				<div style={{fontSize: 36, fontWeight: 700, color: COLOR.cyan}}>Blowoff</div>
				<div style={{fontSize: 28, color: COLOR.textDim}}>too much airflow blows it out</div>
			</div>
			<div style={{position: 'absolute', left: px(0.37) - 150, top: py(f(0.37)) + 28, width: 300, textAlign: 'center', opacity: labelIn(80)}}>
				<div style={{fontSize: 36, fontWeight: 700, color: COLOR.amber}}>Most flammable</div>
			</div>
			<div style={{position: 'absolute', left: px(0.37) - 250, top: py(0.66), width: 500, textAlign: 'center', opacity: labelIn(50)}}>
				<span style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.crimson, letterSpacing: '0.1em'}}>BURNS ABOVE THE CURVE</span>
			</div>
		</div>
	);
};

export const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const tB = cueFrom(S, 's2b');
	const tC = cueFrom(S, 's2c');
	const flamesOut = fadeOut(frame, tC - 5, 20);
	const mapAt = tC - 10;

	return (
		<HudFrame index={2} title="Fire Without Up">
			{frame < tC ? (
				<div style={{position: 'absolute', inset: 0, opacity: flamesOut}}>
					<FlamePanel mode="1g" cx={400} at={20} title="1 g · Earth" caption="Teardrop · flickers · plume rises" />
					<FlamePanel
						mode="0g"
						cx={960}
						at={tB}
						title="0 g · Microgravity"
						caption="Rounder · dimmer · slower"
						extra={
							<div style={{marginTop: 12, fontFamily: FONT.mono, fontSize: 28, color: COLOR.cyan, whiteSpace: 'nowrap', opacity: fade(frame, tB + 60, 18)}}>
								sustained &lt; 1 cm/s airflow
							</div>
						}
					/>
					<FlamePanel
						mode="lunar"
						cx={1520}
						at={tB + 90}
						title="1/6 g · Moon"
						caption="In between · weak plume"
						extra={<Badge kind="limited" label="Limited data" style={{marginTop: 12}} />}
					/>
				</div>
			) : null}

			{frame >= mapAt ? (
				<>
					<div style={{position: 'absolute', left: 190, top: 150, opacity: fade(frame, mapAt + 20, 18)}}>
						<Badge kind="conceptual" label="CONCEPTUAL — after Olson, NASA Glenn — thin fuels only" />
					</div>
					<FlammabilityMap at={mapAt} />
				</>
			) : null}

			<SourceChips
				chips={[
					{label: SOURCES.bass, from: tB + 60, until: tC},
					{label: SOURCES.olson, from: mapAt + 20},
				]}
			/>
			<Voiceover sceneId={S} />
		</HudFrame>
	);
};
