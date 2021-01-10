import postcss from 'rollup-plugin-postcss'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/graph.js',
        format: 'es'
    },
    plugins: [
        postcss(),
        nodeResolve(),
        commonjs()
    ]
};