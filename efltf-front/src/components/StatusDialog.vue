<template>
  <!-- OBRIGATÓRIO: QDialog como elemento raiz + ref="dialogRef" -->
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="q-pa-md" style="min-width: 420px; max-width: 90vw">
      <q-card-section class="q-pb-none">
        <div class="text-h6">Alterar status da OS #{{ ordemIdNum }}</div>
        <div class="text-caption text-grey-7">Selecione o novo status e confirme.</div>
      </q-card-section>

      <q-card-section>
        <q-select
          ref="statusSelect"
          v-model="selectedId"
          :options="statusOptions"

          :loading="optsLoading"
          label="Novo status"

          option-label="label"
          option-value="value"
          emit-value
          map-options

          use-input
          input-debounce="200"
          @filter="onFilter"

          behavior="menu"
          menu-portal
          :popup-content-style="{ maxHeight: '50vh' }"

          dense
          outlined
          clearable

          :disable="saving"
        />
        <div v-if="error" class="text-negative text-caption q-mt-sm">{{ error }}</div>
      </q-card-section>

      <q-card-actions align="right" class="q-pt-none">
        <q-btn flat label="Cancelar" color="grey-7" :disable="saving" @click="onDialogCancel" />
        <q-btn unelevated label="Salvar" color="primary" :loading="saving" :disable="!selectedId || !!error" @click="onSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { Status } from 'src/services/StatusService.js'

defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const statusSelect = ref(null)

const props = defineProps({
  ordemId: { type: [Number, String], required: true },
  currentStatusId: { type: [Number, String], default: null }
})

const ordemIdNum   = computed(() => Number(props.ordemId) || null)

const optsLoading  = ref(false)   // <— loading apenas do QSelect (opções)
const saving       = ref(false)
const error        = ref('')

const statusOptions = ref([])     // [{ label, value }]
const selectedId    = ref(props.currentStatusId != null ? Number(props.currentStatusId) : null)

async function fetchStatuses (term = '') {
  const res   = await Status.getAll({ q: term })
  const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
  return items.map(s => ({
    label: `${s.id} — ${s.nome ?? s.stt_nome ?? s.descricao ?? 'Status'}`,
    value: Number(s.id)
  }))
}

async function loadInitial () {
  try {
    error.value = ''
    optsLoading.value = true
    statusOptions.value = await fetchStatuses()
    // garante seleção inicial se veio via props
    if (!selectedId.value && props.currentStatusId != null) {
      const found = statusOptions.value.find(o => o.value === Number(props.currentStatusId))
      if (found) selectedId.value = found.value
    }
  } catch (err) {
    console.error(err)
    error.value = 'Não foi possível carregar a lista de status.'
  } finally {
    optsLoading.value = false
  }
}

// Padrão recomendado do Quasar: usar update(() => { ... }) dentro do @filter
async function onFilter (val, update, abort) {
  try {
    optsLoading.value = true
    const newOpts = await fetchStatuses(val || '')
    update(() => {
      statusOptions.value = newOpts
    })
  } catch (err) {
    console.error(err)
    error.value = 'Falha ao filtrar os status.'
    update(() => { /* mantém as opções atuais */ })
  } finally {
    optsLoading.value = false
  }
}

async function onSave () {
  if (!selectedId.value) return
  try {
    saving.value = true
    onDialogOK({ id: ordemIdNum.value, stt_id: Number(selectedId.value) })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadInitial()
  await nextTick()
})

watch(() => props.currentStatusId, (nv) => {
  selectedId.value = nv != null ? Number(nv) : null
})
</script>
