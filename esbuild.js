const esbuild = require("esbuild");

const watch = process.argv.includes("--watch");

const ctx = esbuild.context({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: true,
  minify: false,
  logLevel: "info",
});

ctx.then(async (context) => {
  if (watch) {
    await context.watch();
    console.log("Watching for changes...");
  } else {
    await context.rebuild();
    await context.dispose();
  }
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
