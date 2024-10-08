// /* eslint-disable no-undef */
// import adapterCfw from "@sveltejs/adapter-cloudflare-workers";
// import adapterCf from "@sveltejs/adapter-cloudflare";
import vercel from "@sveltejs/adapter-vercel";
import netlify from "@sveltejs/adapter-netlify";
import node from "@sveltejs/adapter-node";
import path from "path";
import { sveltePreprocess } from "svelte-preprocess";
import dotenv from "dotenv";

dotenv.config();

const dev = process.env["NODE_ENV"] === "development";
const ENV_ADAPTER = process.env["BB_ADAPTER"] ?? "node";

const adapters = {
	// "cloudflare-workers": adapterCfw({}),
	// cloudflare: adapterCf(),
	vercel: vercel({ split: false }),
	netlify: netlify({ split: false }),
	node: node({ precompress: true }),
};

const adapter = adapters[ENV_ADAPTER];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({
		sass: false,

		scss: {
			includePaths: ["src"],
			prependData: '@use "./src/global/stylesheet/base/variables" as *;',
			stripIndent: true,
		},
		postcss: { configFilePath: path.resolve("./postcss.config.cjs") },
	}),

	kit: {
		adapter: dev ? node() : adapter,

		alias: {
			$api: path.resolve("./src/routes/api/_lib"),
			"$app/*": path.resolve("./.svelte-kit/runtime/app"),
			$components: path.resolve("./src/lib/components"),
			$env: path.resolve("./src/env.ts"),
			$lib: path.resolve("./src/lib"),
			$stores: path.resolve("./src/lib/stores"),
			"$lib/*": path.resolve("./src/lib"),
		},
		prerender: { concurrency: 3 },
		files: {
			assets: "static",
			lib: "src/lib",
			routes: "src/routes",
			serviceWorker: "src/service-worker",
			appTemplate: "src/app.html",
			hooks: { server: "src/hooks.server" },
		},
		version: { pollInterval: 600000 },
	},
	onwarn(warning, defaultHandler) {
		if (warning.code === "css-unused-selector") return;

		defaultHandler(warning);
	},
};
export default config;
