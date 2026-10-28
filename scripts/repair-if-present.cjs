// Bootstrap must run with Node alone, before package binaries are available.
process.env.NODE_DISABLE_COMPILE_CACHE = process.env.NODE_DISABLE_COMPILE_CACHE || '1';

const { existsSync, lstatSync, rmSync, symlinkSync } = require('fs');
const { join, dirname } = require('path');
const { spawnSync } = require('child_process');

if (process.env.MCR_REPAIR_SKIP === '1' || process.argv.includes('--skip')) {
  process.exit(0);
}

const scriptDir = dirname(__filename);
const repairFileCandidates = [
  join(scriptDir, '..', '..', '_shared', 'repair.mjs'),
  join(scriptDir, '..', '_shared', 'repair.mjs'),
  join(scriptDir, 'repair.mjs'),
];
const repairFile = repairFileCandidates.find((candidate) => existsSync(candidate));
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

if (!repairFile) {
  process.exit(0);
}

const result = spawnSync(process.execPath, [repairFile, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
