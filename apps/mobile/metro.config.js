// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

/**
 * Kelder Metro config.
 *
 * Background: the app's TypeScript sources (App.tsx, screens/*.tsx, theme/*.ts,
 * lib/*.ts, components/*.tsx) are imported with explicit `.js`/`.jsx` extensions,
 * e.g. `import { color } from './theme/tokens.js';` even though only `tokens.ts`
 * exists on disk. Metro tolerates this on native but, for web export, fails with
 * "Unable to resolve module ./theme/tokens.js" because an explicit `.js` suffix
 * is treated as part of the filename rather than an extension to swap.
 *
 * Fix: a custom `resolveRequest`. Metro guarantees that when it invokes a custom
 * resolver, `context.resolveRequest` is set to the *built-in* resolver (so the
 * wrapper cannot recurse). We delegate to `context.resolveRequest` for the
 * normal path; on failure, for relative `.js`/`.jsx` imports only, we retry
 * once with the extension stripped so Metro's standard extensionless resolution
 * finds the matching `.ts`/`.tsx` source. Everything else (monorepo `file:`
 * deps, node_modules, assets) is delegated unchanged.
 */
const config = getDefaultConfig(__dirname);

// Monorepo: @kelder/engine and @kelder/shared are `file:`-linked (symlinks) to
// ../../packages/*, which live outside this app's projectRoot. Metro must be
// allowed to watch those folders or it cannot bundle the symlinked sources.
const monorepoRoot = path.resolve(__dirname, '../..'); // .../kelder
config.watchFolders = [
  ...(config.watchFolders || []),
  path.join(monorepoRoot, 'packages'),
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const delegate = context.resolveRequest;
  try {
    return delegate(context, moduleName, platform);
  } catch (err) {
    const isRelativeJs =
      (moduleName.startsWith('./') || moduleName.startsWith('../')) &&
      (moduleName.endsWith('.js') || moduleName.endsWith('.jsx'));
    if (isRelativeJs) {
      const stripped = moduleName.replace(/\.(jsx?)$/, '');
      return delegate(context, stripped, platform);
    }
    throw err;
  }
};

module.exports = config;
