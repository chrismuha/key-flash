<template>
  <section class="panel">
    <div class="panel-head">
      <h2>0) Workspaces</h2>
      <p>Switch between separate projects with independent fields, rows, templates, and chart history.</p>
    </div>

    <div class="field-form">
      <label>
        Active Workspace
        <select :value="dataStore.activeWorkspaceId" @change="changeWorkspace($event.target.value)">
          <option v-for="workspace in dataStore.sortedWorkspaces" :key="workspace.id" :value="workspace.id">
            {{ workspace.name }}
          </option>
        </select>
      </label>

      <label>
        Workspace Name
        <input v-model.trim="workspaceName" type="text" placeholder="Workspace name" />
      </label>

      <button type="button" @click="createWorkspace">Create Workspace</button>
    </div>

    <div class="settings-actions">
      <button type="button" class="soft" @click="renameWorkspace">Rename Active</button>
      <button
        type="button"
        class="soft danger"
        :disabled="dataStore.workspaces.length <= 1"
        @click="deleteWorkspace"
      >
        Delete Active
      </button>
    </div>

    <p v-if="status" class="settings-note">{{ status }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useDataStore } from '../stores/dataStore';
import { useChartStore } from '../stores/chartStore';

const dataStore = useDataStore();
const chartStore = useChartStore();
const workspaceName = ref('');
const status = ref('');

function syncCurrentWorkspace() {
  dataStore.syncActiveWorkspace(chartStore.snapshotForWorkspace());
}

function applyWorkspace(workspace) {
  if (!workspace) return;
  chartStore.applyWorkspaceSnapshot(workspace.chartState, dataStore.fields, workspace.generatedTracks);
  chartStore.requireManualRefresh('Workspace switched. Click Generate Chart to refresh this workspace.');
}

function changeWorkspace(workspaceId) {
  syncCurrentWorkspace();
  const workspace = dataStore.setActiveWorkspace(workspaceId);
  applyWorkspace(workspace);
  status.value = `Workspace active: ${workspace?.name || 'Unknown'}`;
}

function createWorkspace() {
  syncCurrentWorkspace();
  const id = dataStore.createWorkspace(workspaceName.value);
  const workspace = dataStore.setActiveWorkspace(id);
  applyWorkspace(workspace);
  status.value = `Workspace created: ${workspace?.name || 'Workspace'}`;
  workspaceName.value = '';
}

function renameWorkspace() {
  const name = workspaceName.value;
  if (!name) return;
  dataStore.renameWorkspace(dataStore.activeWorkspaceId, name);
  status.value = `Workspace renamed: ${name}`;
  workspaceName.value = '';
}

function deleteWorkspace() {
  syncCurrentWorkspace();
  const deleted = dataStore.deleteWorkspace(dataStore.activeWorkspaceId);
  if (!deleted) {
    status.value = 'At least one workspace is required.';
    return;
  }
  applyWorkspace(dataStore.activeWorkspace);
  status.value = `Workspace deleted. Active: ${dataStore.activeWorkspace?.name || 'Unknown'}`;
}
</script>
