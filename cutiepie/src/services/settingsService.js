export async function loadSettings() {
  const api = window.cutiepieDesktop?.settings;
  if (!api) return { ok: false };
  return api.load();
}

export async function saveSettings(payload) {
  const api = window.cutiepieDesktop?.settings;
  if (!api) return { ok: false };
  return api.save(payload);
}
