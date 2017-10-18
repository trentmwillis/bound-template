import typescript from 'rollup-plugin-typescript';

export default {
  name: 'BoundTemplate',
  input: './index.ts',
  output: {
    file: './dist/bound-template.js',
    format: 'iife'
  },
  plugins: [
    typescript({
      typescript: require('typescript')
    })
  ]
};
