export async function createBackup() {
  const api = window.cutiepieDesktop?.backup;
  if (!api?.create) return { ok: false };
  return api.create();
}

export async function restoreLatestBackup() {
  const api = window.cutiepieDesktop?.backup;
  if (!api?.restoreLatest) return { ok: false };
  return api.restoreLatest();
}

export async function listBackups() {
  const api = window.cutiepieDesktop?.backup;
  if (!api?.list) return { ok: false, backups: [] };
  return api.list();
}
