import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, fade, range} from '../anim';
import {Badge} from '../components/Badge';
import {HudFrame} from '../components/HudFrame';
import {cueFrom} from '../config';
import {EARTH_AIR, EXPLORATION_AIR} from '../data/facts';
import {TELEMETRY, TELEMETRY_IS_RECORDED, TelemetrySample} from '../data/telemetry';
import {COLOR, FONT} from '../theme';
import {Voiceover} from '../voiceover/Voiceover';

const S = 'Scene5' as const;

const DataBadge: React.FC<{style?: React.CSSProperties}> = ({style}) =>
	TELEMETRY_IS_RECORDED ? <Badge kind="recorded" label="RECORDED · telemetry.csv" style={style} /> : <Badge kind="illustrative" style={style} />;

// ---------------------------------------------------------------- block diagram
type Block = {x: number; y: number; w: number; h: number; title: string; sub: string; tag?: React.ReactNode};
const SENSORS: Block[] = [
	{x: 80, y: 150, w: 500, h: 116, title: 'BME280', sub: 'pressure · temperature'},
	{x: 80, y: 286, w: 500, h: 116, title: 'Fan', sub: 'airflow setting'},
	{x: 80, y: 422, w: 500, h: 116, title: 'MQ-2', sub: 'smoke', tag: <Badge kind="limited" label="ALARM ONLY" />},
];
const ESP: Block = {x: 700, y: 250, w: 300, h: 190, title: 'ESP32', sub: 'microcontroller'};
const DASH: Block = {x: 1440, y: 250, w: 400, h: 190, title: 'Dashboard', sub: 'margin engine'};

const BlockBox: React.FC<{b: Block; opacity: number; accent?: boolean}> = ({b, opacity, accent}) => (
	<div
		style={{
			position: 'absolute',
			left: b.x,
			top: b.y,
			width: b.w,
			height: b.h,
			opacity,
			boxSizing: 'border-box',
			padding: '0 26px',
			borderRadius: 12,
			border: `2px solid ${accent ? COLOR.cyan : 'rgba(56, 189, 248, 0.45)'}`,
			background: accent ? 'rgba(56, 189, 248, 0.09)' : COLOR.panel,
			boxShadow: accent ? '0 0 30px rgba(56,189,248,0.2)' : 'none',
			display: 'flex',
			alignItems: 'center',
			justifyContent: b.tag ? 'space-between' : accent ? 'center' : 'flex-start',
			textAlign: accent ? 'center' : 'left',
		}}
	>
		<div>
			<div style={{fontFamily: FONT.mono, fontSize: accent ? 44 : 34, fontWeight: 700}}>{b.title}</div>
			<div style={{fontSize: 28, color: COLOR.textDim}}>{b.sub}</div>
		</div>
		{b.tag}
	</div>
);

const Link: React.FC<{d: string; progress: number; label?: {x: number; y: number; text: string}}> = ({d, progress, label}) => {
	const frame = useCurrentFrame();
	const L = 800;
	return (
		<g>
			<path d={d} fill="none" stroke={COLOR.cyan} strokeWidth={8} opacity={0.12 * progress} />
			<path d={d} fill="none" stroke={COLOR.cyan} strokeWidth={2.5} strokeDasharray={L} strokeDashoffset={L * (1 - progress)} markerEnd={progress > 0.95 ? 'url(#arrow)' : undefined} />
			{progress >= 1 ? <path d={d} fill="none" stroke={COLOR.text} strokeWidth={4} strokeLinecap="round" strokeDasharray="28 900" strokeDashoffset={-((frame * 5) % 930) + 30} /> : null}
			{label ? (
				<text x={label.x} y={label.y} fill={COLOR.cyan} fontFamily={FONT.mono} fontSize={28} textAnchor="middle" opacity={progress}>
					{label.text}
				</text>
			) : null}
		</g>
	);
};

// ---------------------------------------------------------------- telemetry
const T0 = TELEMETRY[0].t_s;
const T1 = TELEMETRY[TELEMETRY.length - 1].t_s;
const TICKER_EVERY = 5; // show every Nth packet so lines stay readable
const TICKER = TELEMETRY.filter((_, i) => i % TICKER_EVERY === 0);

const packet = (s: TelemetrySample) =>
	`{"t":${s.t_s.toFixed(1)},"pressure_psia":${s.pressure_psia.toFixed(2)},"fan_pct":${s.fan_pct},"smoke_raw":${s.smoke_raw}}`;

const Ticker: React.FC<{dataT: number; opacity: number}> = ({dataT, opacity}) => {
	const LINE = 46;
	const VISIBLE = 6;
	const dt = (T1 - T0) / Math.max(1, TICKER.length - 1);
	const k = (dataT - T0) / dt; // continuous packet index
	const n = Math.floor(k);
	const lines = [];
	for (let i = Math.max(0, n - VISIBLE); i <= Math.min(n, TICKER.length - 1); i++) {
		const y = (VISIBLE - (k - i)) * LINE;
		const o = Math.min(1, (k - i) * 3) * Math.min(1, y / LINE);
		lines.push(
			<div key={i} style={{position: 'absolute', left: 24, top: y, opacity: Math.max(0, o), whiteSpace: 'nowrap', color: i === n ? COLOR.text : COLOR.textDim}}>
				{packet(TICKER[i])}
			</div>,
		);
	}
	return (
		<div
			style={{
				position: 'absolute',
				left: 80,
				top: 590,
				width: 1110,
				height: 400,
				borderRadius: 14,
				border: `1.5px solid ${COLOR.grid}`,
				background: COLOR.panel,
				opacity,
				overflow: 'hidden',
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: `1.5px solid ${COLOR.grid}`}}>
				<span style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.cyan, letterSpacing: '0.08em'}}>USB SERIAL · JSON PACKETS</span>
				<DataBadge />
			</div>
			<div style={{position: 'absolute', top: 76, left: 0, right: 0, bottom: 0, fontFamily: FONT.mono, fontSize: 28, overflow: 'hidden'}}>
				<div style={{position: 'absolute', top: -LINE + 20, left: 0, right: 0}}>{lines}</div>
			</div>
		</div>
	);
};

const Waveform: React.FC<{dataT: number; opacity: number}> = ({dataT, opacity}) => {
	const W = 580;
	const x = (t: number) => ((t - T0) / (T1 - T0)) * W;
	const shown = TELEMETRY.filter((s) => s.t_s <= dataT);
	const lane = (top: number, h: number, lo: number, hi: number) => (v: number) => top + h - ((v - lo) / (hi - lo)) * h;
	const yP = lane(44, 120, 8.2, 14.7);
	const yF = lane(228, 50, 0, 100);
	const smokeVals = TELEMETRY.map((s) => s.smoke_raw);
	const sLo = Math.min(...smokeVals) - 60;
	const sHi = Math.max(...smokeVals) + 60;
	const yS = lane(318, 16, sLo, sHi);
	const path = (fy: (s: TelemetrySample) => number, step = false) =>
		shown
			.map((s, i) => {
				const px = x(s.t_s).toFixed(1);
				if (i === 0) return `M ${px} ${fy(s).toFixed(1)}`;
				return step ? `H ${px} V ${fy(s).toFixed(1)}` : `L ${px} ${fy(s).toFixed(1)}`;
			})
			.join(' ');
	const last = shown[shown.length - 1];

	return (
		<div
			style={{
				position: 'absolute',
				left: 1220,
				top: 590,
				width: 620,
				height: 400,
				borderRadius: 14,
				border: `1.5px solid ${COLOR.grid}`,
				background: COLOR.panel,
				opacity,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px'}}>
				<span style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.cyan, letterSpacing: '0.08em'}}>WAVEFORM</span>
				<DataBadge />
			</div>
			<svg width={W} height={340} style={{position: 'absolute', left: 20, top: 58, overflow: 'visible'}}>
				{[EARTH_AIR.pressurePsia, EXPLORATION_AIR.pressurePsia].map((v) => (
					<g key={v}>
						<line x1={0} x2={W} y1={yP(v)} y2={yP(v)} stroke={COLOR.grid} strokeWidth={2} strokeDasharray="6 8" />
						<text
							x={W}
							y={v === EARTH_AIR.pressurePsia ? yP(v) - 10 : yP(v) + 32}
							fill={COLOR.textDim}
							fontFamily={FONT.mono}
							fontSize={28}
							textAnchor="end"
						>
							{v} psia
						</text>
					</g>
				))}
				<text x={0} y={30} fill={COLOR.cyan} fontFamily={FONT.mono} fontSize={28}>
					pressure_psia
				</text>
				{last ? (
					<>
						<path d={path((s) => yP(s.pressure_psia))} fill="none" stroke={COLOR.cyan} strokeWidth={6} opacity={0.2} />
						<path d={path((s) => yP(s.pressure_psia))} fill="none" stroke={COLOR.cyan} strokeWidth={3} />
						<circle cx={x(last.t_s)} cy={yP(last.pressure_psia)} r={7} fill={COLOR.cyan} />
						<path d={path((s) => yF(s.fan_pct), true)} fill="none" stroke={COLOR.text} strokeWidth={3} />
						<path d={path((s) => yS(s.smoke_raw))} fill="none" stroke={COLOR.amber} strokeWidth={3} />
					</>
				) : null}
				<text x={0} y={218} fill={COLOR.text} fontFamily={FONT.mono} fontSize={28}>
					fan_pct
				</text>
				<text x={0} y={308} fill={COLOR.amber} fontFamily={FONT.mono} fontSize={28}>
					smoke_raw
				</text>
			</svg>
		</div>
	);
};

export const Scene5: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const tB = cueFrom(S, 's5b');

	const blockIn = (d: number) => ease(frame, fps, 15 + d, 30);
	const streamAt = tB - 120; // stream is on screen before and while the narrator describes it
	const dataT = T0 + (T1 - T0) * range(frame, [streamAt, durationInFrames - 20], [0, 1]);

	const escY = ESP.y + ESP.h / 2;
	return (
		<HudFrame index={5} title="Live Hardware Bridge">
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<defs>
					<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
						<path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR.cyan} />
					</marker>
				</defs>
				<Link d={`M 580 208 C 640 208, 640 ${escY - 50}, 700 ${escY - 50}`} progress={blockIn(40)} />
				<Link d={`M 700 ${escY} C 640 ${escY}, 640 344, 580 344`} progress={blockIn(50)} />
				<Link d={`M 580 480 C 640 480, 640 ${escY + 50}, 700 ${escY + 50}`} progress={blockIn(60)} />
				<Link d={`M 1000 ${escY} L 1440 ${escY}`} progress={ease(frame, fps, streamAt - 25, 30)} label={{x: 1220, y: escY - 22, text: 'USB serial · JSON'}} />
			</svg>
			{SENSORS.map((b, i) => (
				<BlockBox key={b.title} b={b} opacity={blockIn(i * 10)} />
			))}
			<BlockBox b={ESP} opacity={blockIn(30)} accent />
			<BlockBox b={DASH} opacity={fade(frame, streamAt - 10, 18)} />

			<Ticker dataT={dataT} opacity={fade(frame, streamAt, 18)} />
			<Waveform dataT={dataT} opacity={fade(frame, streamAt + 10, 18)} />
			<Voiceover sceneId={S} />
		</HudFrame>
	);
};
