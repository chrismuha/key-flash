<template>
  <div v-if="open" class="quit-overlay" role="dialog" aria-modal="true" aria-labelledby="role-title">
    <div class="quit-modal role-modal">
      <p class="quit-kicker">Startup Role</p>
      <h2 id="role-title">Choose Active Role</h2>
      <p class="quit-text">Set role access for this session. You can change it later in Settings.</p>

      <div class="role-options">
        <button
          v-for="role in roles"
          :key="role.value"
          type="button"
          class="soft role-option"
          :class="{ active: selectedRole === role.value }"
          @click="selectedRole = role.value"
        >
          <strong>{{ role.label }}</strong>
          <span>{{ role.description }}</span>
        </button>
      </div>

      <div class="quit-actions">
        <button type="button" class="soft" @click="confirm">Use Selected Role</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const settings = useSettingsStore();

const roles = [
  { value: 'viewer', label: 'Viewer', description: 'Read-only access.' },
  { value: 'analyst', label: 'Analyst', description: 'Generate and annotate charts.' },
  { value: 'manager', label: 'Manager', description: 'Edit row data and chart outputs.' },
  { value: 'editor', label: 'Editor', description: 'Full edit access.' }
];

const selectedRole = ref(settings.roleView);

watch(
  () => props.open,
  () => {
    selectedRole.value = settings.roleView;
  }
);

function confirm() {
  settings.roleView = selectedRole.value;
  emit('close');
}
</script>
