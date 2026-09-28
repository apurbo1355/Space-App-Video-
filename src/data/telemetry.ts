import csvText from './telemetry.csv';
import {USE_RECORDED_TELEMETRY} from '../config';

export type TelemetrySample = {
	t_s: number;
	pressure_psia: number;
	fan_pct: number;
	smoke_raw: number;
};

const parseCsv = (text: string): TelemetrySample[] => {
	const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
	if (lines.length < 2) return [];
	const header = lines[0].split(',').map((h) => h.trim());
	const col = (name: string) => header.indexOf(name);
	const idx = {
		t_s: col('t_s'),
		pressure_psia: col('pressure_psia'),
		fan_pct: col('fan_pct'),
		smoke_raw: col('smoke_raw'),
	};
	if (Object.values(idx).some((i) => i < 0)) {
		throw new Error('telemetry.csv must have columns: t_s, pressure_psia, fan_pct, smoke_raw');
	}
	return lines
		.slice(1)
		.map((line) => {
			const cells = line.split(',').map((c) => Number(c.trim()));
			return {
				t_s: cells[idx.t_s],
				pressure_psia: cells[idx.pressure_psia],
				fan_pct: cells[idx.fan_pct],
				smoke_raw: cells[idx.smoke_raw],
			};
		})
		.filter((s) => Object.values(s).every((v) => Number.isFinite(v)));
};

/**
 * ILLUSTRATIVE ONLY — not measured data. A smooth pump-down from Earth
 * pressure (14.7 psia) toward the exploration atmosphere (8.2 psia), a
 * stepped fan setting, and a flat smoke-sensor baseline.
 */
const illustrative = (): TelemetrySample[] => {
	const out: TelemetrySample[] = [];
	const fanSteps = [20, 40, 60, 40];
	for (let i = 0; i <= 100; i++) {
		const t = i * 0.4; // 0 … 40 s
		const pressure = 8.2 + (14.7 - 8.2) * Math.exp(-t / 9.1);
		const fan = fanSteps[Math.min(fanSteps.length - 1, Math.floor(t / 10))];
		// tiny deterministic wobble so the flat line still reads as "live"
		const smoke = 212 + Math.round(Math.sin(i * 1.7) * 1.4);
		out.push({t_s: Math.round(t * 10) / 10, pressure_psia: Math.round(pressure * 100) / 100, fan_pct: fan, smoke_raw: smoke});
	}
	return out;
};

const recorded = parseCsv(csvText);

export const TELEMETRY_IS_RECORDED = USE_RECORDED_TELEMETRY && recorded.length > 1;
export const TELEMETRY: TelemetrySample[] = TELEMETRY_IS_RECORDED ? recorded : illustrative();
