export async function saveTextExport({ content, defaultName, filters }) {
  const api = window.cutiepieDesktop?.export;
  if (!api?.saveText) {
    return { ok: false, error: 'desktop_api_unavailable' };
  }

  return api.saveText({ content, defaultName, filters });
}
