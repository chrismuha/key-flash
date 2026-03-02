export async function exportCurrentPagePdf(pageName) {
  const api = window.cutiepieDesktop?.pdf;
  if (!api?.exportCurrentPage) {
    return { ok: false, error: 'desktop_api_unavailable' };
  }

  return api.exportCurrentPage({ pageName: String(pageName || 'page') });
}
