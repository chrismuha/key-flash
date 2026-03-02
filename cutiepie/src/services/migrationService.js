function asObject(value) {
  return value && typeof value === 'object' ? value : {};
}

export function migrateState(rawState) {
  const state = asObject(rawState);
  const version = Number(state.version || 1);

  if (version >= 4) return { ...state, version: 4 };

  // v1/v2: flat state model -> v4 workspace model
  if (version <= 2 || !Array.isArray(state.workspaces)) {
    const workspace = {
      id: crypto.randomUUID(),
      name: 'Default Workspace',
      fields: Array.isArray(state.fields) ? state.fields : [],
      rows: Array.isArray(state.rows) ? state.rows : [],
      draftRows: Array.isArray(state.draftRows) ? state.draftRows : [],
      templates: Array.isArray(state.templates) ? state.templates : [],
      customFormulas: Array.isArray(state.customFormulas) ? state.customFormulas : [],
      formulaFields: Array.isArray(state.formulaFields) ? state.formulaFields : [],
      reportExportCount: Number.isFinite(state.reportExportCount) ? state.reportExportCount : 0,
      chartState: {
        chartType: String(state.chartType || ''),
        selectedLabelFieldId: String(state.selectedLabelFieldId || ''),
        selectedValueFieldId: String(state.selectedValueFieldId || ''),
        selectedSecondaryValueFieldId: String(state.selectedSecondaryValueFieldId || ''),
        selectedSeriesFieldId: String(state.selectedSeriesFieldId || '')
      },
      generatedTracks: Array.isArray(state.generatedTracks) ? state.generatedTracks : []
    };

    return {
      version: 4,
      workspaces: [workspace],
      activeWorkspaceId: workspace.id,
      updatedAt: typeof state.updatedAt === 'string' ? state.updatedAt : new Date().toISOString()
    };
  }

  // v3: workspace model missing newer fields
  if (version === 3) {
    return {
      ...state,
      version: 4,
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        customFormulas: Array.isArray(workspace.customFormulas) ? workspace.customFormulas : [],
        formulaFields: Array.isArray(workspace.formulaFields) ? workspace.formulaFields : [],
        reportExportCount: Number.isFinite(workspace.reportExportCount) ? workspace.reportExportCount : 0
      }))
    };
  }

  return { ...state, version: 4 };
}

export function migrateSettings(rawSettings) {
  const settings = asObject(rawSettings);
  const version = Number(settings.version || 1);

  if (version >= 3) return { ...settings, version: 3 };

  return {
    ...settings,
    version: 3,
    chartGoalEnabled: settings.chartGoalEnabled === true,
    chartGoalValue: Number.isFinite(Number(settings.chartGoalValue)) ? Number(settings.chartGoalValue) : 100,
    onboardingCompleted: settings.onboardingCompleted === true,
    alertThresholds: settings.alertThresholds && typeof settings.alertThresholds === 'object'
      ? settings.alertThresholds
      : {
          minGeneratedCharts: 1,
          minPinnedCharts: 1,
          minRowsPerChart: 2,
          minLabelsPerChart: 2,
          maxRowsPerChart: 500
        }
  };
}
