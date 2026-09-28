import React from 'react';
import {fireMargin, formatPct, formatPsia, Material, nearestPoint} from '../data/materials';
import {COLOR, FONT} from '../theme';
import {Badge} from './Badge';

/** O2 % shown across the full width of every gauge. */
export const GAUGE_SCALE_MAX = 60;

export const GAUGE_COLUMNS = {name: 520, bar: 780, margin: 340, gap: 40};

/**
 * One horizontal fire-margin gauge.
 * Bar = O2 % scale. White marker = cabin O2. Tick = material MOC (at the
 * tested pressure nearest the cabin pressure). The span between them is
 * the margin: green when positive, crimson ("BURN ZONE") at zero or below.
 */
export const MarginGauge: React.FC<{
	material: Material;
	cabinO2Pct: number;
	cabinPsia: number;
	highlight?: number;
	reveal?: number;
}> = ({material, cabinO2Pct, cabinPsia, highlight = 0, reveal = 1}) => {
	const pt = nearestPoint(material, cabinPsia);
	const margin = fireMargin(pt.mocPct, cabinO2Pct);
	const burn = margin <= 0;
	const accent = burn ? COLOR.crimson : COLOR.safe;
	const x = (pct: number) => (Math.min(pct, GAUGE_SCALE_MAX) / GAUGE_SCALE_MAX) * GAUGE_COLUMNS.bar;
	const cabinX = x(cabinO2Pct) * reveal;
	const mocX = x(pt.mocPct) * reveal;
	const barH = 26;

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: GAUGE_COLUMNS.gap,
				height: 84,
				padding: '0 20px',
				borderRadius: 10,
				background: burn ? 'rgba(239, 68, 68, 0.07)' : 'rgba(15, 23, 42, 0.55)',
				border: `1.5px solid ${highlight > 0 ? `rgba(56, 189, 248, ${0.3 + 0.6 * highlight})` : burn ? 'rgba(239, 68, 68, 0.35)' : COLOR.grid}`,
				boxShadow: highlight > 0 ? `0 0 ${24 * highlight}px rgba(56, 189, 248, ${0.35 * highlight})` : 'none',
			}}
		>
			<div style={{width: GAUGE_COLUMNS.name, display: 'flex', flexDirection: 'column', gap: 6}}>
				<div style={{fontSize: 30, fontWeight: 600, whiteSpace: 'nowrap'}}>{material.name}</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
					<span style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.cyan, whiteSpace: 'nowrap'}}>
						MOC {formatPct(pt.mocPct)}% @ {formatPsia(pt.testedPressurePsia)} psia
					</span>
					{!pt.verified ? <Badge kind="provisional" style={{fontSize: 28, padding: '4px 10px 3px'}} /> : null}
				</div>
			</div>

			<svg width={GAUGE_COLUMNS.bar} height={70} style={{overflow: 'visible'}}>
				<rect x={0} y={35 - barH / 2} width={GAUGE_COLUMNS.bar} height={barH} rx={6} fill="rgba(30, 41, 59, 0.7)" stroke={COLOR.grid} />
				{[10, 20, 30, 40, 50].map((v) => (
					<line key={v} x1={x(v)} x2={x(v)} y1={35 - barH / 2} y2={35 + barH / 2} stroke={COLOR.bg} strokeWidth={2} opacity={0.8} />
				))}
				{/* margin span */}
				<rect
					x={Math.min(cabinX, mocX)}
					y={35 - barH / 2}
					width={Math.abs(mocX - cabinX)}
					height={barH}
					fill={accent}
					opacity={0.55}
				/>
				{/* cabin O2 fill */}
				<rect x={0} y={35 - barH / 2} width={Math.min(cabinX, mocX)} height={barH} rx={6} fill="rgba(226, 232, 240, 0.16)" />
				{/* MOC tick */}
				<line x1={mocX} x2={mocX} y1={35 - barH / 2 - 12} y2={35 + barH / 2 + 12} stroke={COLOR.cyan} strokeWidth={4} strokeLinecap="round" />
				{/* cabin O2 marker */}
				<line x1={cabinX} x2={cabinX} y1={35 - barH / 2 - 16} y2={35 + barH / 2 + 16} stroke={COLOR.text} strokeWidth={4} strokeLinecap="round" />
				<circle cx={cabinX} cy={35 - barH / 2 - 18} r={6} fill={COLOR.text} />
			</svg>

			<div style={{width: GAUGE_COLUMNS.margin, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16}}>
				{burn ? (
					<span
						style={{
							fontFamily: FONT.mono,
							fontSize: 28,
							fontWeight: 700,
							letterSpacing: '0.08em',
							color: COLOR.crimson,
							border: `2px solid ${COLOR.crimson}`,
							borderRadius: 6,
							padding: '5px 10px 4px',
							background: 'rgba(239, 68, 68, 0.14)',
							whiteSpace: 'nowrap',
						}}
					>
						BURN ZONE
					</span>
				) : null}
				<span style={{fontFamily: FONT.mono, fontSize: 36, fontWeight: 700, color: accent, minWidth: 130, textAlign: 'right'}}>
					{margin > 0 ? '+' : margin < 0 ? '−' : ''}
					{Math.abs(margin).toFixed(1)}
				</span>
			</div>
		</div>
	);
};
