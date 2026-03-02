export async function getDiagnostics() {
  const api = window.cutiepieDesktop?.diagnostics;
  if (!api?.get) return { ok: false, error: 'desktop_api_unavailable' };
  return api.get();
}
