<template>
  <LicenseGateElectron
    account="c2f558c7-1a58-4d31-bbf0-e231d6efcb5b"
    storageKey="examiner_license"
    expectedProductId="YOUR_PRODUCT_ID_HERE"
    :fingerprint="machineId"
    :requireFingerprint="true"
    @activated="onActivated"
  >
    <template #default="{ license, keyValue }">
      <div id="app">
        <!-- Your real Electron renderer app goes here -->
        <YourRealApp />
      </div>
    </template>
  </LicenseGateElectron>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LicenseGateElectron from './LicenseGateElectron.vue'
import YourRealApp from './YourRealApp.vue'

const machineId = ref('')

onMounted(async () => {
  try {
    if (window?.api?.getMachineId) {
      machineId.value = await window.api.getMachineId()
    } else {
      console.warn('window.api.getMachineId is not available, using fallback ID')
      machineId.value = 'fallback-machine-id'
    }
  } catch (err) {
    console.error('Error getting machine ID:', err)
    machineId.value = 'error-machine-id'
  }
})

function onActivated({ key, license }) {
  console.log('Electron app activated with key:', key, license)
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
