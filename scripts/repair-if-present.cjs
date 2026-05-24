const { existsSync, lstatSync, rmSync, symlinkSync } = require('fs');
const { join, dirname } = require('path');
const { spawnSync } = require('child_process');

const scriptDir = dirname(__filename);
const repairFile = join(scriptDir, '..', '_shared', 'repair.mjs');
const appRoot = join(scriptDir, '..');

function ensureSymlink(linkPath, targetPath) {
  let current = null;

  try {
    current = lstatSync(linkPath);
  } catch {
    current = null;
  }

  if (current?.isSymbolicLink()) {
    return false;
  }

  if (current) {
    rmSync(linkPath, { force: true, recursive: true });
  }

  symlinkSync(targetPath, linkPath);
  return true;
}

function repairElectronFrameworkLinks() {
  const frameworkRoot = join(
    appRoot,
    'node_modules',
    'electron',
    'dist',
    'Electron.app',
    'Contents',
    'Frameworks',
    'Electron Framework.framework'
  );
  const versionARoot = join(frameworkRoot, 'Versions', 'A');

  if (!existsSync(versionARoot)) {
    return;
  }

  const repaired = [
    ensureSymlink(join(frameworkRoot, 'Helpers'), 'Versions/A/Helpers'),
    ensureSymlink(join(frameworkRoot, 'Libraries'), 'Versions/A/Libraries'),
    ensureSymlink(join(frameworkRoot, 'Resources'), 'Versions/A/Resources'),
    ensureSymlink(join(frameworkRoot, 'Versions', 'Current'), 'A'),
  ].filter(Boolean).length;

  if (repaired > 0) {
    process.stdout.write(`Repaired Electron framework links (${repaired}).\n`);
  }
}

repairElectronFrameworkLinks();

if (!existsSync(repairFile)) {
  process.exit(0);
}

const result = spawnSync(process.execPath, [repairFile, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

process.exit(result.status ?? 0);
