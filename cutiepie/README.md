# CutiePie

CutiePie is an Electron + Vue chart workspace for building charts from custom fields, managing multiple workspaces, and exporting data/reports.

## What The App Includes

- Builder workflow for fields, row entry, chart generation, formulas, templates, and import/export wizards.
- Dashboard for generated chart history, pinning, notes, and KPI cards.
- Reports page for report-focused PDF export.
- Settings page for role view, save behavior, category options, backup/restore, and display/performance settings.
- Startup role selection modal with role-permission info.

## Role Permission Ladder

Role permissions are cumulative from lowest to highest.

1. `Viewer`
- Read-only access.
- Can view builder/dashboard/settings/reports data.
- Cannot edit fields, edit rows, or generate charts.

2. `Analyst` = `Viewer` + additional permissions
- Includes **everything Viewer has**.
- Can generate charts.
- Can pin and annotate generated chart history.
- Still cannot edit fields or row data.

3. `Manager` = `Analyst` + additional permissions
- Includes **everything Analyst has** (and therefore Viewer too).
- Can edit row data (draft/apply/delete rows).
- Still cannot change field structure.

4. `Editor` = `Manager` + additional permissions
- Includes **everything Manager has** (and therefore Analyst and Viewer too).
- Can edit field structure (add/remove fields).
- Full builder access.

Example hierarchy statement: **Editor has everything Manager has**, plus field-structure editing.

## Workspaces

- Each workspace has its own:
- fields
- applied rows + draft rows
- templates
- chart selections
- generated chart history (including pins/notes)
- Use Workspace controls in Builder to create, switch, rename, or delete workspaces.

## Formulas

- Formula Builder adds calculated numeric fields into your dataset.
- Formulas are stored one-per-file in `src/formulas/` for easy maintenance.
- Included formulas:
- Add
- Subtract
- Multiply
- Divide
- Minimum
- Maximum
- Running Total
- Moving Average (3)
- Percent Change
- Percent Of Total
- Difference From Average

## Import / Export

- Import wizard supports CSV and JSON with preview, mapping, type selection, and invalid-value handling.
- Export wizard supports CSV, JSON, and PDF.
- All exports open a **Save As** location picker before writing files.
- Header `Export Page as PDF` exports the current visible page.

## Local Storage

App data is saved locally via Electron in your user data directory.

- State file: `cutiepie-state.json`
- Settings file: `cutiepie-settings.json`
- Backup directory: `backups/`

## Run / Build

- Install dependencies: `npm install`
- Run dev web app: `npm run dev:web`
- Build production web bundle: `npm run build`
- Launch Electron app: `npm start`
- Basic checks: `npm run test`
