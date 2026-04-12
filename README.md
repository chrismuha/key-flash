# KeyFlash Pro

A modular Electron + Vite desktop app that flashes the screen when keyboard keys are pressed.

## Included upgrades
- Separate components/modules
- Modern UI
- Live slider labels
- Live color palette preview
- Fullscreen toggle button
- F11 fullscreen shortcut
- Multiple key support
- Delay before flash
- Minimum gap between flashes
- Flash duration
- Flash strength / opacity
- Reset to default rainbow colors
- Local saved settings with electron-store
- Packaging with electron-builder

## Project structure
```text
electron/
  main.js
  preload.js
src/
  components/
    flash.js
    keyboard.js
    settings.js
    state.js
    ui.js
  main.js
  style.css
index.html
vite.config.js
package.json
```

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
