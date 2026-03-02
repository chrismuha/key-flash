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
