
export async function load(api, def) {
  try { return { ...def, ...(await api.getSettings()) }; }
  catch { return def; }
}

export async function save(api, s) {
  return await api.setSettings(s);
}
