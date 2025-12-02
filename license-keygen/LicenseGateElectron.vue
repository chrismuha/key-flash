<template>
  <div class="license-page">
    <div v-if="activated && !checkingSavedLicense">
      <slot :license="licenseData" :keyValue="savedKey">
        <h2>Application Unlocked 🎉</h2>
        <p>Your license is active.</p>
      </slot>
    </div>
    <div v-else>
      <h1 class="license-title">Activate Your License</h1>
      <div v-if="checkingSavedLicense" class="license-status">Checking existing activation…</div>
      <form v-else class="license-form" @submit.prevent="handleSubmit">
        <label class="license-label" for="licenseKey">Product key</label>
        <input
          id="licenseKey"
          v-model.trim="licenseKey"
          class="license-input"
          placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX"
          autocomplete="off"
          required
        />
        <button
          class="license-button"
          type="submit"
          :disabled="submitting || !licenseKey || !fingerprintReady"
        >
          {{ submitting ? 'Validating…' : 'Activate' }}
        </button>
        <p v-if="!fingerprintReady" class="license-status">Waiting for machine ID…</p>
        <p v-if="error" class="license-error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  account: { type: String, required: true },
  storageKey: { type: String, default: 'app_license_activation' },
  expectedProductId: { type: String, default: '' },
  fingerprint: { type: String, default: '' },
  requireFingerprint: { type: Boolean, default: true }
})

const emit = defineEmits(['activated'])

const licenseKey = ref('')
const submitting = ref(false)
const error = ref('')
const activated = ref(false)
const checkingSavedLicense = ref(true)

const licenseData = ref(null)
const savedKey = ref('')

const fingerprintReady = computed(() => {
  if (!props.requireFingerprint) return true
  return !!props.fingerprint
})

function initSavedLicense() {
  try {
    const saved = localStorage.getItem(props.storageKey)
    if (!saved) {
      checkingSavedLicense.value = false
      return
    }
    const parsed = JSON.parse(saved)
    if (parsed?.key && parsed?.license) {
      activated.value = true
      licenseData.value = parsed.license
      savedKey.value = parsed.key
      emit('activated', { key: parsed.key, license: parsed.license })
    }
  } catch {
    // ignore
  } finally {
    checkingSavedLicense.value = false
  }
}

onMounted(() => {
  initSavedLicense()
})

async function validateKey(key) {
  const endpoint = `https://api.keygen.sh/v1/accounts/${props.account}/licenses/actions/validate-key`
  const metaBody = { key }
  if (props.fingerprint) {
    metaBody.scope = { fingerprint: props.fingerprint }
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json'
    },
    body: JSON.stringify({ meta: metaBody })
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(
      json?.errors?.[0]?.detail ||
        json?.errors?.[0]?.title ||
        'License validation failed'
    )
  }

  if (!json.meta?.valid) {
    throw new Error(json.meta?.detail || 'Invalid or already used product key')
  }

  if (props.expectedProductId) {
    const productId = json?.data?.relationships?.product?.data?.id
    if (productId && productId !== props.expectedProductId) {
      throw new Error('This license key is not for this product')
    }
  }

  return json
}

async function handleSubmit() {
  error.value = ''

  if (!fingerprintReady.value) {
    error.value = 'Machine ID is not ready yet. Please wait a moment.'
    return
  }

  submitting.value = true

  try {
    const key = licenseKey.value
    if (!key) throw new Error('Please enter a product key')

    const result = await validateKey(key)

    activated.value = true
    licenseData.value = result.data
    savedKey.value = key

    localStorage.setItem(
      props.storageKey,
      JSON.stringify({ key, license: result.data })
    )

    emit('activated', { key, license: result.data })
  } catch (e) {
    error.value = e.message || 'Could not validate product key'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.license-page {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #ddd;
  font-family: system-ui, sans-serif;
}

.license-title {
  margin-bottom: 1rem;
  text-align: center;
}

.license-status {
  text-align: center;
  font-size: 0.9rem;
}

.license-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.license-label {
  font-weight: 600;
}

.license-input {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #bbb;
}

.license-input:focus {
  outline: none;
  border-color: #666;
}

.license-button {
  padding: 0.55rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
}

.license-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.license-error {
  color: #b00020;
}
</style>
