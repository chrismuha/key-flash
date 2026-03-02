export async function loadState() {
  const api = window.cutiepieDesktop?.state;
  if (!api) return { ok: false };
  return api.load();
}

export async function saveState(payload) {
  const api = window.cutiepieDesktop?.state;
  if (!api) return { ok: false };
  return api.save(payload);
}

export async function clearState() {
  const api = window.cutiepieDesktop?.state;
  if (!api) return { ok: false };
  return api.clear();
}
