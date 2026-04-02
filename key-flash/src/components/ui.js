
export function ui() {
  document.getElementById('app').innerHTML = `
    <div id="flash" style="position:fixed;inset:0;background:black;opacity:0"></div>
    <button id="save">Save</button>
  `;
  return {
    flash: document.getElementById('flash'),
    save: document.getElementById('save')
  };
}
