import { describe, expect, it } from 'vitest';
import { migrateSettings, migrateState } from '../src/services/migrationService';

describe('migrationService', () => {
  it('migrates flat legacy state to workspace model', () => {
    const migrated = migrateState({
      version: 2,
      fields: [{ id: 'f1', name: 'Value', type: 'number' }],
      rows: [{ f1: '10' }],
      draftRows: [{ f1: '10' }],
      chartType: 'line',
      selectedValueFieldId: 'f1'
    });

    expect(migrated.version).toBe(4);
    expect(Array.isArray(migrated.workspaces)).toBe(true);
    expect(migrated.workspaces[0].fields[0].name).toBe('Value');
    expect(migrated.workspaces[0].chartState.chartType).toBe('line');
  });

  it('migrates settings and backfills onboarding/goal defaults', () => {
    const migrated = migrateSettings({ version: 2, performanceMode: 'fast' });
    expect(migrated.version).toBe(3);
    expect(migrated.performanceMode).toBe('fast');
    expect(migrated.chartGoalEnabled).toBe(false);
    expect(migrated.onboardingCompleted).toBe(false);
    expect(migrated.alertThresholds.maxRowsPerChart).toBe(500);
  });
});
