import postcss from 'rollup-plugin-postcss'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/graph.js',
        format: 'es'
    },
    plugins: [
        replace({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        postcss(),
        nodeResolve(),
        commonjs()
    ]
};