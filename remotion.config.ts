import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(20);

// Allow `import csv from './telemetry.csv'` (raw text) for the telemetry bridge.
Config.overrideWebpackConfig((config) => ({
	...config,
	module: {
		...config.module,
		rules: [
			...(config.module?.rules ?? []),
			{test: /\.csv$/, type: 'asset/source'},
		],
	},
}));

// Optional: point Remotion at a locally installed Chrome/Chromium.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
	Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
