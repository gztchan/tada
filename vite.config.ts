import { dirname, resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url'

import tsconfig from './tsconfig.app.json'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const port = parseInt(env.PORT); // MUST BE LOWERCASE

	return {
		plugins: [react(), tailwindcss()],
    esbuild: {
      tsconfigRaw: JSON.stringify(tsconfig),
    },
		base: './',
		build: {
      rollupOptions: {
        input: {
          note: resolve(__dirname, 'tada/templates', 'note.html'),
          dashboard: resolve(__dirname, 'tada/templates', 'dashboard.html'),
          about: resolve(__dirname, 'tada/templates', 'about.html'),
        },
      },
			outDir: 'dist/react',
		},
		server: {
			port, // MUST BE LOWERCASE
			strictPort: true,
		},
	};
});