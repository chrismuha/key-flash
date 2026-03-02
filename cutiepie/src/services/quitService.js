export function subscribeQuitRequests(onRequest) {
  const api = window.cutiepieDesktop;
  if (!api?.onQuitRequested) return () => {};
  return api.onQuitRequested(onRequest);
}

export async function confirmQuit() {
  const api = window.cutiepieDesktop?.quit;
  if (!api?.confirm) return { ok: false };
  return api.confirm();
}

export async function cancelQuit() {
  const api = window.cutiepieDesktop?.quit;
  if (!api?.cancel) return { ok: false };
  return api.cancel();
}

export async function saveAndQuit() {
  try {
    if (window.__CUTIEPIE_PERSIST_STATE) {
      await window.__CUTIEPIE_PERSIST_STATE();
    }
    if (window.__CUTIEPIE_PERSIST_SETTINGS) {
      await window.__CUTIEPIE_PERSIST_SETTINGS();
    }
  } catch (_error) {
    // proceed to quit prompt action even if save fails
  }
  return confirmQuit();
}
