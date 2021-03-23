import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const plugins = [
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfigOverride: { exclude: ['**/__tests__/**', '**/setupTests.*'] },
  }),
  terser(),
];
const getOutputModule = (moduleName) => [
  {
    file: pkg.exports[moduleName].require,
    format: 'cjs',
    exports: 'named',
  },
  {
    file: pkg.exports[moduleName].import,
    format: 'es',
  },
];

const config = [
  {
    plugins,
    input: './src/cancelablePromise.ts',
    output: getOutputModule('./cancelablePromise'),
  },
  {
    plugins,
    input: './src/CancelableRequest.ts',
    output: getOutputModule('./CancelableRequest'),
  },
  { plugins, input: './src/index.ts', output: getOutputModule('.') },
];

export default config;
