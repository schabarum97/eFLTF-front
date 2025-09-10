<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">Consulta de Ordens</div>

    <ConsultaPage
      ref="consultaRef"
      :service="OrdemService"
      :filterFields="filterFields"
      :columns="columns"
      :rowActions="rowActions"
      title="Consulta de Ordens"
      :autoSearch="true"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ConsultaPage from 'src/components/ConsultaPage.vue'
import { Ordem }    from 'src/services/OrdemService.js'
import { Cliente }  from 'src/services/ClienteService.js'
import { Endereco } from 'src/services/EnderecoService.js'
import { Cidade }   from 'src/services/CidadeService.js'
import { Status }   from 'src/services/StatusService.js'
import { Veiculo }  from 'src/services/VeiculoService.js'
import StatusDialog from 'src/components/StatusDialog.vue'
import { Responsavel } from 'src/services/ResponsavelService.js'

const router = useRouter()
const $q = useQuasar()
const consultaRef = ref(null)

const OrdemService = {
  async getAll () {
    return await Ordem.getAll()
  }
}

const statusOptions = ref([])

const filterFields = ref([
  { model: 'id', label: 'ID', type: 'number' },

  {
    model: 'cli_id', label: 'Cliente', type: 'lookup',
    optionLabel: 'label', optionValue: 'value',
    async fetchOptions (term) {
      const { items } = await Cliente.getAll({ q: term })
      return (items || []).map(c => ({ label: `${c.id} – ${c.nome}`, value: c.id }))
    }
  },

  {
    model: 'end_id', label: 'Endereço', type: 'lookup',
    dependsOn: 'cli_id', optionLabel: 'label', optionValue: 'value',
    async fetchOptions (term, ctx) {
      const cliId = ctx?.filters?.cli_id
      if (!cliId) return []
      const { items } = await Endereco.getAll({ q: term, cli_id: cliId })
      return (items || []).map(e => ({
        label: `${e.id} – ${e.logradouro}, ${e.numero}${e.bairro ? ' - ' + e.bairro : ''}`,
        value: e.id
      }))
    }
  },

  {
    model: 'stt_id', label: 'Status', type: 'lookup',
    optionLabel: 'label', optionValue: 'value',
    options: statusOptions.value
  },

  {
    model: 'cid_id', label: 'Cidade', type: 'lookup',
    optionLabel: 'label', optionValue: 'value',
    async fetchOptions (term) {
      const { items } = await Cidade.getAll({ q: term })
      return (items || []).map(c => ({ label: `${c.id} – ${c.nome} / ${c.uf_sigla}`, value: c.id }))
    }
  },

  {
    model: 'responsavel_id', label: 'Responsável', type: 'lookup',
    optionLabel: 'label', optionValue: 'value',
    async fetchOptions (term) {
      const { items } = await Responsavel.getAll({ q: term })
      return (items || []).map(c => ({ label: `${c.id} – ${c.nome}`, value: c.id }))
    }
  },

  {
    model: 'vei_id', label: 'Veículo', type: 'lookup',
    optionLabel: 'label', optionValue: 'value',
    async fetchOptions (term) {
      const { items } = await Veiculo.getAll({ q: term })
      return (items || []).map(v => ({ label: `${v.placa} – ${v.modelo}`, value: v.id }))
    }
  },

  {
    model: 'data', label: 'Data', type: 'date',
    format: 'YYYY-MM-DD',
    displayFormat: 'DD/MM/YYYY'
  },

  { model: 'observacao', label: 'Observação', type: 'text', maxlength: 200 }
])

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'cliente_nome', label: 'Cliente', field: 'cliente_nome', sortable: true },
  {
    name: 'endereco', label: 'Endereço',
    field: r => {
      const b = r.end_bairro ? ' - ' + r.end_bairro : ''
      return `${r.end_logradouro}, ${r.end_numero}${b}`
    },
    sortable: false
  },
  { name: 'cidade', label: 'Cidade/UF', field: r => `${r.cidade_nome} / ${r.uf_sigla}`, sortable: true },
  { name: 'status_nome', label: 'Status', field: 'status_nome', sortable: true },
  { name: 'data', label: 'Data', field: 'data', sortable: true, type: 'date', displayFormat: 'DD/MM/YYYY' },
  { name: 'hora', label: 'Hora', field: 'hora', sortable: true },
  { name: 'responsavel_nome', label: 'Responsável', field: 'responsavel_nome', sortable: true },
  { name: 'observacao', label: 'Observação', field: 'observacao', sortable: false },
  { name: 'veiculo', label: 'Veículo', field: r => r.veiculo_placa ? `${r.veiculo_placa} — ${r.veiculo_modelo}` : '', sortable: false}
]

const rowActions = [
  {
    label: 'Abrir OS',
    icon: 'open_in_new',
    color: 'grey-8',
    handler: (row) => {
      router.push({ name: 'ordemfull', query: { ord_id: row.id } })
    }
  },
  {
    label: 'Alterar dados OS',
    icon: 'published_with_changes',
    color: 'grey-8',
    show: () => true,
    handler: (row) => {
      $q.dialog({
        component: StatusDialog,
        componentProps: {
          ordemId: Number(row.id),
          currentStatusId: row.stt_id ?? null,
          currentResponsavelId: row.responsavel_id ?? null,
          currentVeiculoId: row.vei_id ?? null,
          currentObservacao: row.observacao ?? ''
        }
      })
      .onOk(async ({ id, stt_id, usu_id, vei_id, observacao }) => {
        try {
          await Ordem.update({ id, stt_id, usu_id, vei_id, observacao })
          $q.notify({ type: 'positive', message: `OS #${id} atualizada.` })
          consultaRef.value?.reload?.()
        } catch (err) {
          console.error(err)
          $q.notify({ type: 'negative', message: 'Erro ao atualizar OS. ' + (err?.response?.data || err?.message || '') })
        }
      })
    }
  }
]

onMounted(async () => {
  try {
    const st = await Status.getAll()
    statusOptions.value = (st.items || []).map(s => ({ label: s.nome, value: s.id }))

    const stField = filterFields.value.find(f => f.model === 'stt_id')
    if (stField) stField.options = statusOptions.value
  } catch (e) {
    console.warn('Falha ao carregar opções de Status/UF:', e?.response?.data || e?.message)
  }
})
</script>
