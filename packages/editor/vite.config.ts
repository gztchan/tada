import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
	return {
    build: {
      lib: {
        // 入口文件
        entry: resolve(__dirname, './src/index.ts'), // 或 .js
        // name: 'MyLib', // UMD 构建时的全局变量名
        fileName: (format) => `editor.${format}.js`, // 输出文件名
        formats: ['es'], // 输出格式
      },
      rollupOptions: {
        // 外部化依赖，不打包进库中
        external: ['react'],
        output: {
          globals: {
            react: 'React',
          },
        },
      },
      sourcemap: true,
      emptyOutDir: true,
    },
		plugins: [
      // react(),
      // tailwindcss(),
      dts({
        insertTypesEntry: true, // 自动在 package.json 添加 "types"
        rollupTypes: true       // 合并多个 .d.ts
      })
    ],
		base: './',
	};
});