import postcss from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: [{
        file: 'dist/graph.js',
        format: 'es'
    }, {
        file: 'dist/graph.min.js',
        format: 'es',
        plugins: [
            terser()
        ]
    }],
    plugins: [
        postcss(),
        nodeResolve(),  //  locates modules using the Node resolution algorithm, for using third party modules in node_modules
        commonjs()  //  convert CommonJS modules to ES6
    ]
};