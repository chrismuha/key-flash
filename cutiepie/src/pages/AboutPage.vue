<template>
  <section class="panel">
    <div class="panel-head">
      <h2>About CutiePie</h2>
      <p>CutiePie is a desktop analytics studio with separated Vue pages/components for fast iteration.</p>
    </div>
    <p class="settings-note">Architecture: Vue Router pages + Pinia stores + service layer + chart components.</p>

    <div class="panel-head" style="margin-top: 1rem;">
      <h2>Definitions</h2>
      <p>Common terms used across the app.</p>
    </div>
    <p class="settings-note"><strong>KPI</strong>: Key Performance Indicator. A tracked metric used to quickly measure performance.</p>
    <p class="settings-note"><strong>Workspace</strong>: A separate project area with its own fields, rows, templates, chart settings, and chart history.</p>
    <p class="settings-note"><strong>Draft Row</strong>: A row being edited that is not committed until Apply is used.</p>
    <p class="settings-note"><strong>Apply Row / Apply All</strong>: Commits draft edits into active data used for chart generation.</p>
    <p class="settings-note"><strong>Generated Track</strong>: A history entry for a chart render, including chart type, row count, and labels count.</p>
    <p class="settings-note"><strong>Pinned Chart</strong>: A chart history item marked important so it stays prioritized in Dashboard lists.</p>
    <p class="settings-note"><strong>Threshold Alert</strong>: A warning shown when KPI or chart metrics are outside configured limits.</p>
    <p class="settings-note"><strong>Formula Field</strong>: A calculated numeric field created from existing numeric fields.</p>
    <p class="settings-note"><strong>Custom Formula</strong>: A user-defined expression formula (for example with v1, v2) that can be saved and reused.</p>
    <p class="settings-note"><strong>Performance Mode</strong>: Controls live chart re-render delay after Builder changes (Fast, Balanced, Quality).</p>
    <p class="settings-note"><strong>Auto-save</strong>: Automatically writes state updates to local storage when enabled.</p>
    <p class="settings-note"><strong>Backup / Restore</strong>: Creates a snapshot of local app files and restores the most recent backup.</p>
    <p class="settings-note"><strong>Export</strong>: Saves CSV, JSON, or PDF output using a Save As location picker.</p>
  </section>
</template>
