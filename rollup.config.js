const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");
const babel = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const replace = require("@rollup/plugin-replace");
const typescript = require("rollup-plugin-typescript2");

module.exports = {
  input: "src/index.tsx",
  output: {
    dir: "dist",
    format: "amd",
    sourcemap: true,
    amd: {
      forceJsExtensionForImports: true,
    },
  },
  plugins: [
    typescript(),
    nodeResolve(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("development"),
      preventAssignment: true,
    }),
    babel(),
    commonjs(),
    serve({
      open: true,
      verbose: true,
      contentBase: ["public", "dist"],
      host: "localhost",
      port: 3000,
    }),
    livereload({ watch: ["public", "dist"] }),
  ],
  external: ["react", "react-dom"],
};
