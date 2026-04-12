export const DEFAULTS = {
  flashDelayMs: 0,
  minTimeBetweenFlashesMs: 120,
  flashDurationMs: 160,
  colors: ['#ff0000','#ff7f00','#ffff00','#00ff00','#0000ff','#4b0082','#9400d3'],
  colorOrder: 'sequence',
  flashOpacity: 1,
  fullscreenOnLaunch: false
};

export function createState() {
  return {
    settings: { ...DEFAULTS },
    pressedKeys: new Set(),
    colorIndex: 0,
    lastFlashAt: 0,
    queuedFlash: null,
    isFullscreen: false
  };
}
