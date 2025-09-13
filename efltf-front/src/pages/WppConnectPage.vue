<template>
  <q-page class="q-pa-md column items-center justify-start">

    <div class="text-h6 q-mb-xs">Conectar WhatsApp</div>

    <div class="column items-center q-gutter-xs q-mb-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-subtitle2">Status:</div>
        <q-badge :color="badgeColor" align="middle">{{ prettyStatus }}</q-badge>
      </div>

      <div class="text-caption text-grey-7">
        <template v-if="status === 'reconnecting'">
          Tentativa {{ reconnect.attempt }} — aguardando {{ Math.ceil((reconnect.delay || 0) / 1000) }}s…
        </template>
        <template v-else>
          <q-icon name="qr_code_2" size="16px" class="q-mr-xs" />
          <span v-if="expectQr === true">Provável que peça QR nesta inicialização</span>
          <span v-else-if="expectQr === false">Deve entrar direto (sessão salva)</span>
          <span v-else>&nbsp;</span>
        </template>
      </div>
    </div>

    <div v-if="qrDataUrl" class="q-pa-md bg-white shadow-2 qr-wrap">
      <img :src="qrDataUrl" alt="QR Code" class="qr-img" />
    </div>

    <div v-else class="text-grey q-mt-md">
      <template v-if="status === 'ready'">Conectado! 🎉</template>
      <template v-else-if="status === 'reconnecting'">
        Reconectando…
        <q-linear-progress indeterminate class="q-mt-sm" style="width: 240px"/>
      </template>
      <template v-else>Aguardando QR…</template>
    </div>

    <div class="row q-gutter-sm q-mt-lg">
      <q-btn color="primary" :loading="loading.start" :disable="status === 'reconnecting'" label="Iniciar / Reconectar" @click="start" />
      <q-btn color="warning" :loading="loading.soft" label="Desconectar" @click="disconnect(false)" />
      <q-btn color="negative" :loading="loading.hard" label="Resetar sessão (QR)" @click="disconnect(true)" />
    </div>

    <div class="row items-center q-gutter-sm q-mt-md">
      <q-toggle v-model="autoReconnect"
                color="teal"
                label="Reconexão automática"
                @update:model-value="setAutoReconnect"/>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { toDataURL } from 'qrcode'
import { Whatsapp } from 'src/services/WppService.js'

const $q = useQuasar()

const status = ref('idle')
const expectQr = ref(undefined)
const reconnect = ref({ enabled: true, attempt: 0, delay: 0 })
const qrDataUrl = ref(null)
const autoReconnect = ref(true)
const loading = ref({ start: false, soft: false, hard: false })
let es = null

const prettyStatus = computed(() => {
  const s = status.value || 'idle'
  if (s.startsWith('wa_state:')) return s.replace('wa_state:', 'WA ')
  return s
})

const badgeColor = computed(() => ({
  idle: 'grey',
  qr: 'teal',
  authenticated: 'blue',
  ready: 'green',
  auth_failure: 'red',
  disconnected: 'orange',
  error: 'red',
  reconnecting: 'amber'
}[status.value] || (status.value?.startsWith('wa_state:') ? 'blue' : 'grey')))

async function start () {
  try {
    loading.value.start = true
    await Whatsapp.start()
    $q.notify({ type: 'positive', message: 'Inicializando cliente WhatsApp…' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Erro ao iniciar WhatsApp' })
  } finally {
    loading.value.start = false
  }
}

async function disconnect (hard = false) {
  try {
    if (hard) loading.value.hard = true
    else loading.value.soft = true

    // desligar auto-reconnect antes do disconnect (evita reconectar logo após)
    await Whatsapp.setAutoReconnect(false)
    autoReconnect.value = false

    await Whatsapp.disconnect(hard)
    $q.notify({
      type: 'warning',
      message: hard
        ? 'Desconectado e sessão apagada. Próxima inicialização pedirá QR.'
        : 'Desconectado.'
    })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Erro ao desconectar' })
  } finally {
    loading.value.hard = false
    loading.value.soft = false
  }
}

async function setAutoReconnect (enabled) {
  try {
    await Whatsapp.setAutoReconnect(enabled)
    autoReconnect.value = !!enabled
    $q.notify({
      type: enabled ? 'positive' : 'info',
      message: enabled ? 'Reconexão automática ativada' : 'Reconexão automática desativada'
    })
  } catch (err) {
    console.error(err)
    autoReconnect.value = !enabled
    $q.notify({ type: 'negative', message: 'Falha ao alterar reconexão automática' })
  }
}

onMounted(async () => {
  // status inicial (pega também o estado de reconexão)
  try {
    const cur = await Whatsapp.status()
    status.value = cur.status || 'idle'
    if (cur.reconnect) {
      reconnect.value = cur.reconnect
      autoReconnect.value = !!cur.reconnect.enabled
    }
  } catch (_) {}

  // inicia back
  start()

  es = Whatsapp.connectEvents(async (type, payload) => {
    if (type === 'status') {
      if (typeof payload.status !== 'undefined') status.value = payload.status
      if (typeof payload.expectQr !== 'undefined') expectQr.value = payload.expectQr
      if (payload.reconnect) reconnect.value = payload.reconnect

      // se não está em QR, limpa imagem
      if (status.value !== 'qr') qrDataUrl.value = null
    }
    if (type === 'qr') {
      try {
        qrDataUrl.value = await toDataURL(payload.qr) // texto → imagem
        status.value = 'qr'
        expectQr.value = true
      } catch (e) {
        console.error('Falha ao renderizar QR:', e)
      }
    }
  })
})

onBeforeUnmount(() => {
  es?.close?.()
})
</script>

<style scoped>
.qr-wrap { border-radius: 12px; }
.qr-img { width: 280px; height: 280px; }
</style>
