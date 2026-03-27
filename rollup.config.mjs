import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [{
    input: 'src/index.ts',
    external: (id) => id.includes('__tests__'),
    output: [{
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      },
    ],
    plugins: [
      peerDepsExternal(),
      typescript({
        tsconfig: './tsconfig.json'
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [{
      file: 'dist/index.d.ts',
      format: 'esm'
    }],
    plugins: [dts()],
  },
];