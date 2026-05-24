import { DEFAULTS } from './state.js';

export function parseColors(raw) {
  return raw
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function normalizeColorOrder(value) {
  return value === 'random' ? 'random' : 'sequence';
}

export function normalizeNumber(value, fallback, min = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.round(n));
}

export function normalizeFloat(value, fallback, min = 0, max = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function getNormalizedSettings(formValues) {
  const parsedColors = parseColors(formValues.colorsText);
  return {
    flashDelayMs: normalizeNumber(formValues.flashDelayMs, DEFAULTS.flashDelayMs, 0),
    minTimeBetweenFlashesMs: normalizeNumber(formValues.minTimeBetweenFlashesMs, DEFAULTS.minTimeBetweenFlashesMs, 0),
    flashDurationMs: normalizeNumber(formValues.flashDurationMs, DEFAULTS.flashDurationMs, 20),
    colorOrder: normalizeColorOrder(formValues.colorOrder),
    flashOpacity: normalizeFloat(formValues.flashOpacity, DEFAULTS.flashOpacity, 0.1, 1),
    fullscreenOnLaunch: Boolean(formValues.fullscreenOnLaunch),
    focusMode: Boolean(formValues.focusMode),
    showHero: Boolean(formValues.showHero),
    showSettingsPanel: Boolean(formValues.showSettingsPanel),
    showStatusPanel: Boolean(formValues.showStatusPanel),
    closeSettingsOnOutsideClick: Boolean(formValues.closeSettingsOnOutsideClick),
    colors: parsedColors.length ? parsedColors : [...DEFAULTS.colors]
  };
}

export async function loadSettings(api) {
  try {
    const saved = await api.getSettings();
    return {
      ...DEFAULTS,
      ...saved,
      colorOrder: normalizeColorOrder(saved?.colorOrder),
      focusMode: Boolean(saved?.focusMode),
      showHero: saved?.showHero !== false,
      showSettingsPanel: saved?.showSettingsPanel !== false,
      showStatusPanel: saved?.showStatusPanel !== false,
      closeSettingsOnOutsideClick: saved?.closeSettingsOnOutsideClick !== false,
      colors: Array.isArray(saved?.colors) && saved.colors.length ? saved.colors : [...DEFAULTS.colors]
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(api, settings) {
  return api.setSettings(settings);
}
