import path from 'node:path';
import { fileURLToPath } from 'node:url';
import log from 'electron-log';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

log.info('electron-forge: forge.config.js');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  for (const element of fs.readdirSync(from)) {
      const stat = fs.lstatSync(path.join(from, element));
      if (stat.isFile()) {
        fs.copyFileSync(path.join(from, element), path.join(to, element));
      } else if (stat.isDirectory()) {
        copyFolderSync(path.join(from, element), path.join(to, element));
      }
  }
}

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
const config = {
  packagerConfig: {
    name: 'Tada',
    executableName: 'Tada',
    appBundleId: 'com.shkain.tada',
    icon: [path.resolve(__dirname, 'assets/tada/icon.icns'), path.resolve(__dirname, 'assets/tada/icon.ico')],
    asar: true,
    // osxSign: {
    //   identity: 'Developer ID Application: Shklin (C2K322G57H)',
    //   'hardened-runtime': true,
    //   'gatekeeper-assess': false,
    //   // 'signature-flags': 'library',
    // },
    // osxNotarize: {
    //   tool: 'notarytool',
    //   appleId: 'shklin@gmail.com',
    //   appleIdPassword: 'shklin@gmail.com',
    //   teamId: 'C2K322G57H',
    // },
    extraResource: [
      path.resolve(__dirname, 'assets'),
    ],
    ignore: [
      /^\/packages/,
      /^\/tada/,
      /^\/out/,
      // /^\/node_modules/,
      /\.map$/,
      /tsconfig.*\.json$/,
      /vite\.config\.ts$/,
      /forge\.config\.js$/,
      /package-lock\.json$/,
      /pnpm-lock\.yaml$/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
  hooks: {
    packageAfterCopy: async (config, buildPath) => {
      const nativeModules = [
          'api',
          'database'
      ];

      const nodeModulesSource = path.resolve(process.cwd(), 'packages');
      const nodeModulesDest = path.join(buildPath, 'node_modules/@tada');

      // fs.copyFileSync(path.resolve(process.cwd(), 'node_modules', '.bin', 'prisma'), path.join(buildPath, 'node_modules', '.bin', 'prisma'));

      fs.rmSync(path.join(nodeModulesDest), { recursive: true, force: true })
      fs.mkdirSync(path.join(nodeModulesDest), { recursive: true })

      for (const mod of nativeModules) {
          const src = path.join(nodeModulesSource, mod);
          const dest = path.join(nodeModulesDest, mod);
          if (fs.existsSync(src)) {
              log.info(`Copying ${mod} to ${dest}`);
              try {
                copyFolderSync(src, dest);
              } catch (error) {
                log.error(`Error copying ${mod} to ${dest}: ${error}`);
              }
          }
      }

      fs.mkdirSync(path.join(buildPath, '..', 'node_modules'))
      fs.cpSync(path.join(buildPath, 'node_modules'), path.join(buildPath, '..', 'node_modules'), { recursive: true })
    }
  }
};

export default config;
