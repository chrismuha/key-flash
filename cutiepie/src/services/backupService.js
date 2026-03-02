export async function createBackup() {
  const api = window.cutiepieDesktop?.backup;
  if (!api?.create) return { ok: false, error: 'backup_api_unavailable' };
  return api.create();
}

export async function restoreLatestBackup() {
  const api = window.cutiepieDesktop?.backup;
  if (!api?.restoreLatest) return { ok: false, error: 'backup_api_unavailable' };
  return api.restoreLatest();
}
