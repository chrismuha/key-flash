import { describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useDataStore } from '../src/stores/dataStore';

describe('core smoke flows', () => {
  it('supports workspace clone/reset and undo/redo flows', () => {
    setActivePinia(createPinia());
    const store = useDataStore();

    const startWorkspaceId = store.activeWorkspaceId;
    store.addField('Revenue', 'number');
    expect(store.fields.some((f) => f.name === 'Revenue')).toBe(true);

    const didUndo = store.undo();
    expect(didUndo).toBe(true);
    expect(store.fields.some((f) => f.name === 'Revenue')).toBe(false);

    const didRedo = store.redo();
    expect(didRedo).toBe(true);
    expect(store.fields.some((f) => f.name === 'Revenue')).toBe(true);

    const cloneId = store.cloneWorkspace(startWorkspaceId);
    expect(cloneId).toBeTruthy();
    store.setActiveWorkspace(cloneId);
    expect(store.activeWorkspaceId).toBe(cloneId);

    const resetOk = store.resetActiveWorkspace();
    expect(resetOk).toBe(true);
    expect(store.fields.some((f) => f.name === 'Day')).toBe(true);
  });
});
