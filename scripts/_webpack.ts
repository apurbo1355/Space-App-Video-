import type {WebpackOverrideFn} from '@remotion/bundler';

/** Same override as remotion.config.ts (the Node API does not read that file). */
export const webpackOverride: WebpackOverrideFn = (config) => ({
	...config,
	module: {
		...config.module,
		rules: [...(config.module?.rules ?? []), {test: /\.csv$/, type: 'asset/source'}],
	},
});
