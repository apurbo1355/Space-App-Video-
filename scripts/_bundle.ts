import path from 'path';
import {bundle} from '@remotion/bundler';
import {webpackOverride} from './_webpack';

export const makeBundle = () =>
	bundle({entryPoint: path.join(process.cwd(), 'src/index.ts'), webpackOverride});

export const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
