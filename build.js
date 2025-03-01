#!/usr/bin/env node

const esbuild = require("esbuild");
const path = require("path");

async function build() {
  try {
    console.log("Building TypeScript project...");

    const result = await esbuild.build({
      entryPoints: ["src/app.ts", "src/sigma-gui/sigma-gui.ts"],
      bundle: true,
      outdir: "dist",
      minify: true,
      platform: "browser",
      target: "es2020",
      format: "esm",
      sourcemap: true,
      loader: {
        ".ts": "ts",
      },
    });

    console.log("Build completed successfully!");

    if (result.warnings.length > 0) {
      console.log("Warnings:");
      result.warnings.forEach((warning) => console.warn(warning));
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
