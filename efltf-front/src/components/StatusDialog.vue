<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="q-pa-md" style="min-width: 420px; max-width: 90vw">
      <q-card-section class="q-pb-none">
        <div class="text-h6">Alterar dados da OS #{{ ordemIdNum }}</div>
        <div class="text-caption text-grey-7">
          Selecione o novo status, responsável, veículo e ajuste a observação.
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-sm">
        <!-- STATUS -->
        <q-select
          ref="statusSelect"
          v-model="selectedStatusId"
          :options="statusOptions"
          :loading="optsLoading"
          label="Novo status"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          use-input
          input-debounce="200"
          @filter="onFilterStatus"
          behavior="menu"
          menu-portal
          :popup-content-style="{ maxHeight: '50vh' }"
          dense
          outlined
          clearable
          :disable="saving"
        />

        <!-- RESPONSÁVEL -->
        <q-select
          v-model="selectedRespId"
          :options="respOptions"
          :loading="respLoading"
          label="Responsável"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          use-input
          input-debounce="200"
          @filter="onFilterResp"
          behavior="menu"
          menu-portal
          :popup-content-style="{ maxHeight: '50vh' }"
          dense
          outlined
          clearable
          :disable="saving"
        />

        <!-- VEÍCULO -->
        <q-select
          v-model="selectedVeiId"
          :options="veiOptions"
          :loading="veiLoading"
          label="Veículo"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          use-input
          input-debounce="200"
          @filter="onFilterVei"
          behavior="menu"
          menu-portal
          :popup-content-style="{ maxHeight: '50vh' }"
          dense
          outlined
          clearable
          :disable="saving"
        />

        <!-- OBSERVAÇÃO -->
        <q-input
          v-model="observacao"
          type="textarea"
          autogrow
          label="Observação"
          maxlength="200"
          counter
          dense
          outlined
          :disable="saving"
        />

        <div v-if="error" class="text-negative text-caption q-mt-sm">{{ error }}</div>
      </q-card-section>

      <q-card-actions align="right" class="q-pt-none">
        <q-btn flat label="Cancelar" color="grey-7" :disable="saving" @click="onDialogCancel" />
        <q-btn
          unelevated
          label="Salvar"
          color="primary"
          :loading="saving"
          :disable="!selectedStatusId || !!error"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { Status } from 'src/services/StatusService.js'
import { Responsavel } from 'src/services/ResponsavelService.js'
import { Veiculo } from 'src/services/VeiculoService.js'

defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const statusSelect = ref(null)

const props = defineProps({
  ordemId: { type: [Number, String], required: true },
  currentStatusId: { type: [Number, String], default: null },
  currentResponsavelId: { type: [Number, String], default: null },
  currentVeiculoId: { type: [Number, String], default: null },
  currentObservacao: { type: String, default: '' }
})

const ordemIdNum = computed(() => Number(props.ordemId) || null)

const optsLoading = ref(false)
const saving      = ref(false)
const error       = ref('')

// STATUS
const statusOptions    = ref([])
const selectedStatusId = ref(props.currentStatusId != null ? Number(props.currentStatusId) : null)

// RESPONSÁVEL
const respOptions   = ref([])
const selectedRespId = ref(props.currentResponsavelId != null ? Number(props.currentResponsavelId) : null)
const respLoading   = ref(false)

// VEÍCULO
const veiOptions   = ref([])
const selectedVeiId = ref(props.currentVeiculoId != null ? Number(props.currentVeiculoId) : null)
const veiLoading   = ref(false)

// OBSERVAÇÃO
const observacao = ref(props.currentObservacao || '')

async function fetchStatuses (term = '') {
  const res   = await Status.getAll({ q: term })
  const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
  return items.map(s => ({
    label: `${s.id} — ${s.nome ?? s.stt_nome ?? s.descricao ?? 'Status'}`,
    value: Number(s.id)
  }))
}

async function fetchResponsaveis (term = '') {
  const res   = await Responsavel.getAll({ q: term })
  const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
  return items.map(r => ({
    label: `${r.id} — ${r.nome ?? r.responsavel_nome ?? r.descricao ?? 'Responsável'}`,
    value: Number(r.id)
  }))
}

async function fetchVeiculos (term = '') {
  const res   = await Veiculo.getAll({ q: term })
  const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
  return items.map(v => ({
    label: `${v.id} — ${v.placa ?? v.veiculo_placa ?? '---'}${v.modelo ? ' • ' + v.modelo : ''}`,
    value: Number(v.id)
  }))
}

async function loadInitial () {
  try {
    error.value = ''
    optsLoading.value = true

    statusOptions.value = await fetchStatuses()
    respOptions.value   = await fetchResponsaveis()
    veiOptions.value    = await fetchVeiculos()

    if (!selectedStatusId.value && props.currentStatusId != null) {
      const found = statusOptions.value.find(o => o.value === Number(props.currentStatusId))
      if (found) selectedStatusId.value = found.value
    }
    if (!selectedRespId.value && props.currentResponsavelId != null) {
      const found = respOptions.value.find(o => o.value === Number(props.currentResponsavelId))
      if (found) selectedRespId.value = found.value
    }
    if (!selectedVeiId.value && props.currentVeiculoId != null) {
      const found = veiOptions.value.find(o => o.value === Number(props.currentVeiculoId))
      if (found) selectedVeiId.value = found.value
    }
  } catch (err) {
    console.error(err)
    error.value = 'Não foi possível carregar as listas.'
  } finally {
    optsLoading.value = false
  }
}

async function onFilterStatus (val, update) {
  try {
    optsLoading.value = true
    const newOpts = await fetchStatuses(val || '')
    update(() => { statusOptions.value = newOpts })
  } catch (err) {
    console.error(err)
    error.value = 'Falha ao filtrar os status.'
    update(() => {})
  } finally {
    optsLoading.value = false
  }
}

async function onFilterResp (val, update) {
  try {
    respLoading.value = true
    const newOpts = await fetchResponsaveis(val || '')
    update(() => { respOptions.value = newOpts })
  } catch (err) {
    console.error(err)
    error.value = 'Falha ao filtrar responsáveis.'
    update(() => {})
  } finally {
    respLoading.value = false
  }
}

async function onFilterVei (val, update) {
  try {
    veiLoading.value = true
    const newOpts = await fetchVeiculos(val || '')
    update(() => { veiOptions.value = newOpts })
  } catch (err) {
    console.error(err)
    error.value = 'Falha ao filtrar veículos.'
    update(() => {})
  } finally {
    veiLoading.value = false
  }
}

async function onSave () {
  if (!selectedStatusId.value) return
  try {
    saving.value = true
    onDialogOK({
      id: ordemIdNum.value,
      stt_id: Number(selectedStatusId.value),
      usu_id: selectedRespId.value != null ? Number(selectedRespId.value) : null,
      vei_id: selectedVeiId.value != null ? Number(selectedVeiId.value) : null,
      observacao: (observacao.value || '').trim()
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadInitial()
  await nextTick()
})

watch(() => props.currentStatusId, (nv) => {
  selectedStatusId.value = nv != null ? Number(nv) : null
})
watch(() => props.currentResponsavelId, (nv) => {
  selectedRespId.value = nv != null ? Number(nv) : null
})
watch(() => props.currentVeiculoId, (nv) => {
  selectedVeiId.value = nv != null ? Number(nv) : null
})
watch(() => props.currentObservacao, (nv) => {
  observacao.value = nv || ''
})
</script>
