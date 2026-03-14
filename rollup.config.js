import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import withSolid from 'rollup-preset-solid';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

export default withSolid({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
    },
    // {
    //   file: 'dist/index.cjs',
    //   format: 'cjs',
    // }
  ],
  plugins: [
    typescript(), 
    resolve(), 
    json(), 
    terser(),
    postcss({
      modules: true, // 启用CSS Modules
      extract: 'styles/style.css', // 抽取CSS到dist/styles目录下，文件名保持与源文件相同
      plugins: [autoprefixer()], // 添加任何你需要的PostCSS插件
    }),
  ],
  external: ['solid-js'],
});
