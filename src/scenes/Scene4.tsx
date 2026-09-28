import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, fade, lerp} from '../anim';
import {Badge, BadgeKind} from '../components/Badge';
import {GAUGE_COLUMNS, MarginGauge} from '../components/Gauge';
import {HudFrame} from '../components/HudFrame';
import {SourceChips} from '../components/SourceChip';
import {cueFrom} from '../config';
import {EARTH_AIR, EXPLORATION_AIR, SOURCES} from '../data/facts';
import {fireMargin, formatPct, formatPsia, MATERIALS, nearestPoint, SOURCE} from '../data/materials';
import {COLOR, FONT} from '../theme';
import {Voiceover} from '../voiceover/Voiceover';

const S = 'Scene4' as const;
const LEFT = 80;
const EVIDENCE_ID = 'silicone';

const Readout: React.FC<{label: string; value: string; badge: BadgeKind; x: number; w: number; opacity: number}> = ({
	label,
	value,
	badge,
	x,
	w,
	opacity,
}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: 212,
			width: w,
			height: 112,
			padding: '12px 20px',
			boxSizing: 'border-box',
			borderRadius: 12,
			border: `1.5px solid ${COLOR.grid}`,
			background: COLOR.panel,
			opacity,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
		}}
	>
		<span style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.textDim, letterSpacing: '0.04em', whiteSpace: 'nowrap'}}>{label}</span>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
			<span style={{fontFamily: FONT.mono, fontSize: 36, fontWeight: 700, whiteSpace: 'nowrap'}}>{value}</span>
			<Badge kind={badge} style={{padding: '3px 10px 2px'}} />
		</div>
	</div>
);

const Field: React.FC<{k: string; children: React.ReactNode}> = ({k, children}) => (
	<div style={{display: 'flex', gap: 20}}>
		<div style={{width: 170, flexShrink: 0, fontFamily: FONT.mono, fontSize: 28, color: COLOR.textDim, paddingTop: 2}}>{k}</div>
		<div style={{fontSize: 30, display: 'flex', flexDirection: 'column', gap: 8}}>{children}</div>
	</div>
);

const EvidenceDrawer: React.FC<{at: number; cabinPsia: number; cabinO2: number}> = ({at, cabinPsia, cabinO2}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const k = ease(frame, fps, at, 32);
	const m = MATERIALS.find((x) => x.id === EVIDENCE_ID)!;
	const used = nearestPoint(m, cabinPsia);
	const margin = fireMargin(used.mocPct, cabinO2);
	const anyUnverified = m.points.some((p) => !p.verified);
	const W = 800;
	return (
		<div
			style={{
				position: 'absolute',
				top: 200,
				left: 1920 - W * k,
				width: W,
				height: 770,
				padding: '30px 36px',
				boxSizing: 'border-box',
				borderRadius: '16px 0 0 16px',
				borderLeft: `2px solid ${COLOR.cyan}`,
				background: COLOR.bg,
				boxShadow: '-30px 0 60px rgba(0,0,0,0.6)',
				display: 'flex',
				flexDirection: 'column',
				gap: 20,
			}}
		>
			<div style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.cyan, letterSpacing: '0.12em'}}>EVIDENCE DRAWER</div>
			<div style={{fontSize: 42, fontWeight: 700}}>{m.name}</div>
			<div style={{height: 1.5, background: COLOR.grid}} />
			<Field k="SOURCE">
				<span>{SOURCE.authors}</span>
				<span style={{color: COLOR.textDim}}>{SOURCE.facility}</span>
			</Field>
			<Field k="NTRS ID">
				<span style={{fontFamily: FONT.mono}}>{SOURCE.ntrsId}</span>
			</Field>
			<Field k="TABLE">
				<span>{SOURCE.table}</span>
			</Field>
			<Field k="MOC">
				{m.points.map((p) => (
					<span key={p.testedPressurePsia} style={{fontFamily: FONT.mono, display: 'flex', gap: 14, alignItems: 'center'}}>
						{formatPct(p.mocPct)}% @ {formatPsia(p.testedPressurePsia)} psia
						{p === used ? <Badge kind="published" style={{padding: '3px 10px 2px'}} /> : null}
					</span>
				))}
			</Field>
			<Field k="MARGIN">
				<span style={{fontFamily: FONT.mono, display: 'flex', gap: 14, alignItems: 'center', color: margin <= 0 ? COLOR.crimson : COLOR.safe}}>
					{margin > 0 ? '+' : margin < 0 ? '−' : ''}
					{Math.abs(margin).toFixed(1)} pts
					<Badge kind="calculated" style={{padding: '3px 10px 2px'}} />
				</span>
			</Field>
			<Field k="STATUS">
				{anyUnverified ? (
					<>
						<span>
							<Badge kind="provisional" />
						</span>
						<span style={{fontSize: 28, color: COLOR.textDim}}>not yet checked against the PDF</span>
					</>
				) : (
					<Badge kind="verified" />
				)}
			</Field>
		</div>
	);
};

export const Scene4: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tB = cueFrom(S, 's4b');
	const tC = cueFrom(S, 's4c');

	// Scenario sweep: Earth air → NASA's planned exploration atmosphere.
	const sweep = interpolate(frame, [tB + 20, tB + 200], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.cubic),
	});
	const cabinPsia = lerp(EARTH_AIR.pressurePsia, EXPLORATION_AIR.pressurePsia, sweep);
	const cabinO2 = lerp(EARTH_AIR.o2Pct, EXPLORATION_AIR.o2Pct, sweep);
	const ppO2 = cabinPsia * (cabinO2 / 100);

	const dashAt = 70;
	const readouts = [
		{label: 'CABIN PRESSURE', value: `${cabinPsia.toFixed(1)} psia`, badge: 'measured' as const, w: 450},
		{label: 'CABIN O₂', value: `${cabinO2.toFixed(1)} %`, badge: 'published' as const, w: 400},
		{label: 'O₂ PARTIAL PRESSURE', value: `≈ ${ppO2.toFixed(1)} psia`, badge: 'calculated' as const, w: 500},
	];
	const scenarioLabel = sweep <= 0 ? 'EARTH AIR' : sweep >= 1 ? 'EXPLORATION' : 'EARTH → EXPLOR.';

	return (
		<HudFrame index={4} title="Fire Margin Gauges">
			{/* definition strip */}
			<div style={{position: 'absolute', left: LEFT, top: 112, opacity: fade(frame, 12, 18)}}>
				<div style={{fontFamily: FONT.mono, fontSize: 40, fontWeight: 700}}>
					FIRE MARGIN = <span style={{color: COLOR.cyan}}>MOC</span> − <span style={{color: COLOR.text}}>CABIN O₂ %</span>
				</div>
				<div style={{marginTop: 6, fontSize: 28, color: COLOR.textDim}}>
					MOC = highest O₂ % at which the material always puts itself out (NASA-STD-6001 Test 1)
				</div>
			</div>
			<div style={{position: 'absolute', right: 80, top: 118, display: 'flex', gap: 16, opacity: fade(frame, 40, 18)}}>
				<Badge kind="verified" label="> 0  PUTS ITSELF OUT" />
				<Badge kind="provisional" label="≤ 0  BURN ZONE" style={{color: COLOR.crimson, borderColor: COLOR.crimson, background: 'rgba(239,68,68,0.12)'}} />
			</div>

			{/* readouts */}
			{readouts.map((r, i) => (
				<Readout
					key={r.label}
					{...r}
					x={LEFT + readouts.slice(0, i).reduce((sum, q) => sum + q.w + 20, 0)}
					opacity={fade(frame, dashAt + i * 8, 15)}
				/>
			))}
			<div
				style={{
					position: 'absolute',
					left: LEFT + 1410,
					top: 212,
					width: 350,
					height: 112,
					padding: '12px 20px',
					boxSizing: 'border-box',
					borderRadius: 12,
					border: `1.5px solid rgba(56,189,248,0.5)`,
					background: 'rgba(56, 189, 248, 0.06)',
					opacity: fade(frame, dashAt + 24, 15),
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				}}
			>
				<span style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.textDim, whiteSpace: 'nowrap'}}>MOCK · SCENARIO</span>
				<span style={{fontFamily: FONT.mono, fontSize: 28, fontWeight: 700, color: COLOR.cyan, whiteSpace: 'nowrap'}}>{scenarioLabel}</span>
			</div>

			{/* column headers */}
			<div
				style={{
					position: 'absolute',
					left: LEFT + 20,
					top: 342,
					display: 'flex',
					gap: GAUGE_COLUMNS.gap,
					alignItems: 'center',
					opacity: fade(frame, dashAt + 30, 15),
					fontFamily: FONT.mono,
					fontSize: 28,
					color: COLOR.textDim,
				}}
			>
				<div style={{width: GAUGE_COLUMNS.name, display: 'flex', gap: 12, alignItems: 'center'}}>
					MATERIAL · MOC <Badge kind="published" style={{padding: '3px 10px 2px'}} />
				</div>
				<div style={{width: GAUGE_COLUMNS.bar, display: 'flex', gap: 28}}>
					<span>O₂ % SCALE</span>
					<span style={{color: COLOR.cyan}}>┃ MOC</span>
					<span style={{color: COLOR.text}}>● CABIN O₂</span>
				</div>
				<div style={{width: GAUGE_COLUMNS.margin, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end'}}>
					MARGIN <Badge kind="calculated" style={{padding: '3px 10px 2px'}} />
				</div>
			</div>

			{/* gauges */}
			<div style={{position: 'absolute', left: LEFT, top: 392, width: 1760, display: 'flex', flexDirection: 'column', gap: 6}}>
				{MATERIALS.map((m, i) => {
					const at = dashAt + 40 + i * 10;
					return (
						<div key={m.id} style={{opacity: fade(frame, at, 15)}}>
							<MarginGauge
								material={m}
								cabinO2Pct={cabinO2}
								cabinPsia={cabinPsia}
								reveal={ease(frame, fps, at, 30)}
								highlight={m.id === EVIDENCE_ID ? fade(frame, tC - 10, 15) : 0}
							/>
						</div>
					);
				})}
			</div>

			{frame >= tC - 2 ? <EvidenceDrawer at={tC} cabinPsia={cabinPsia} cabinO2={cabinO2} /> : null}

			<SourceChips
				chips={[
					{label: SOURCES.std6001, from: 12},
					{label: SOURCES.harperTable, from: dashAt + 40},
				]}
			/>
			<Voiceover sceneId={S} />
		</HudFrame>
	);
};
