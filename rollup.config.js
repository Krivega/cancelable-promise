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
// const getOutputModule = (moduleName) => [
//   {
//     file: pkg.exports[moduleName].require,
//     format: 'cjs',
//     exports: 'named',
//   },
//   {
//     file: pkg.exports[moduleName].import,
//     format: 'es',
//   },
// ];

const config = {
  plugins,
  input: pkg['main:src'],
  output: [
    { file: pkg.main, format: 'umd', sourcemap: true, name: 'cancelablePromise' },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
};

// input: './src/index.ts', output: getOutputModule('.')

export default config;
