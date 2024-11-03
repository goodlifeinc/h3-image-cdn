import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

function build() {
    return [{
        input: './src/index.js',
        output: [
            {
                preserveModules: true,
                dir: 'dist',
                format: 'cjs',
                exports: 'auto',
                entryFileNames: '[name].cjs'
            }
        ],
        plugins: [
            resolve(),
            commonjs()
        ],
        external: [/node_modules/]
    }];
}

export default build();
