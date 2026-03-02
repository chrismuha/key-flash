# Import / Export Compatibility Guide

This guide reduces import errors by documenting the exact formats CutiePie expects.

## Supported Import Types

1. CSV (`.csv`)
2. JSON (`.json`)

## CSV Import Rules

- First row must be a header row.
- Each header becomes a source column in the import wizard.
- Empty trailing lines are ignored.
- Quoted CSV values are supported (commas inside quotes are safe).

### CSV Example

```csv
Day,Category,Revenue,Cost
2026-03-01,Retail,1200,700
2026-03-02,Wholesale,1800,950
```

## JSON Import Rules

CutiePie accepts either of these JSON styles:

1. Array of objects

```json
[
  {"Day":"2026-03-01","Category":"Retail","Revenue":"1200"},
  {"Day":"2026-03-02","Category":"Wholesale","Revenue":"1800"}
]
```

2. Export-style object with `fields` + `rows`

```json
{
  "fields": [
    {"id":"field-day","name":"Day","type":"date"},
    {"id":"field-category","name":"Category","type":"text"},
    {"id":"field-revenue","name":"Revenue","type":"number"}
  ],
  "rows": [
    {"field-day":"2026-03-01","field-category":"Retail","field-revenue":"1200"}
  ]
}
```

## Type Compatibility Notes

- `text`: any value.
- `number`: should parse as numeric (`1200`, `99.5`, `-4`).
- `date`: `YYYY-MM-DD` recommended.

The import wizard allows overriding type inference and choosing invalid-value behavior:

- Leave blank
- Skip row
- Keep original text
- Set to `0` (numbers)

## Export Compatibility

- CSV exports are Excel-friendly and include a header row.
- JSON exports include fields + rows and can be re-imported.
- PDF exports use current page rendering and open a Save As picker.

## Common Mistakes

1. Missing CSV header row.
2. Using non-date text in date columns.
3. Using currency symbols in number columns without cleanup (`$1,200`).
4. Expecting import to merge by key: current flow replaces dataset when Apply Import is used.

## Sample Files

Use these before importing production data:

- `samples/import-sample.csv`
- `samples/import-sample-array.json`
- `samples/import-sample-export-style.json`
- `samples/export-sample.csv`
- `samples/export-sample.json`
- `samples/export-sample-report.pdf`
- `samples/export-sample-page.pdf`
