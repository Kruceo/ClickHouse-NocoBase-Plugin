import banner2 from 'rollup-plugin-banner2';
import fs from 'fs'
import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import replace from "@rollup/plugin-replace"
import json from "@rollup/plugin-json"
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

const deps = JSON.parse(fs.readFileSync('./package.json', 'utf8')).dependencies;
const serialized = JSON.stringify(deps);
export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'cjs',
        preserveModules: true,
        exports: "named",
        entryFileNames: "[name].js",
    },
    plugins: [
        // replace({
        //     '__INJECT_DEPS__': serialized
        // }),
        typescript({ tsconfig: "./tsconfig.json" }),
        // commonjs(),
        // resolve({
        //     resolveOnly: (moduleName) => {
        //         console.log(process.cwd());
        //         return !/react|^@nocobase\//.test(moduleName)
        //     }
        // }),
        // terser({ toplevel: true, output: { comments: false } }),
        banner2(() => `/**
* Copyright (c) 2025 Kruceo
* This file is part of @kruceo/clickhouse-datasource.
* Read the license file "LICENSE" at root of package 
*/\n\n`)
    ],
};
