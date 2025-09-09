<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">Consulta de Pagamentos</div>

    <ConsultaPage
      ref="consultaRef"
      :service="OrdemPag"
      :filterFields="filterFields"
      :columns="columns"
      :rowActions="rowActions"
      :rowClass="rowClass"
      title="Consulta de Pagamentos"
      :autoSearch="true"
    />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import ConsultaPage from 'src/components/ConsultaPage.vue'

import { OrdemPag } from 'src/services/OrdemPagService.js'
import { Cliente }  from 'src/services/ClienteService.js'
import { FormaPag } from 'src/services/FormaPagService.js'

const $q = useQuasar()
const consultaRef = ref(null)

const filterFields = [
  { model: 'ord_id', label: 'Ordem de Serviço', type: 'number', dense: true },

  {
    model: 'cli_id',
    label: 'Cliente',
    type: 'lookup',
    optionLabel: 'label',
    optionValue: 'value',
    dense: true,
    async fetchOptions (term) {
      const { items } = await Cliente.getAll({ q: term })
      return (items || []).map(c => ({ label: `${c.id} – ${c.nome}`, value: c.id }))
    },
    async resolveOption (id) {
      if (!id) return null
      try {
        const { item } = await Cliente.getById(id)
        return { label: `${item.id} – ${item.nome}`, value: item.id }
      } catch { return null }
    }
  },

  { model: 'vencimento', label: 'Data de Vencimento', type: 'date', dense: true },

  {
    model: 'fpg_id',
    label: 'Forma de Pagamento',
    type: 'lookup',
    optionLabel: 'label',
    optionValue: 'value',
    dense: true,
    async fetchOptions (term) {
      const { items } = await FormaPag.getAll({ q: term })
      return (items || []).map(f => ({
        label: `${f.id} – ${f.nome}${f.parcelado === 'S' ? ' (parcelado)' : ''}`,
        value: f.id
      }))
    },
    async resolveOption (id) {
      if (!id) return null
      try {
        const { item } = await FormaPag.getById(id)
        return {
          label: `${item.id} – ${item.nome}${item.parcelado === 'S' ? ' (parcelado)' : ''}`,
          value: item.id
        }
      } catch { return null }
    }
  }
]

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'ordem_id', label: 'Ordem', field: 'ordem_id', align: 'left', sortable: true },
  { name: 'cliente_nome', label: 'Cliente', field: 'cliente_nome', align: 'left', sortable: true },
  { name: 'forma_pagamento_nome', label: 'Forma', field: 'forma_pagamento_nome', align: 'left' },
  { name: 'parcela', label: 'Parcela', field: 'parcela', align: 'left', sortable: true },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'left',
    sortable: true,
    format: val => {
      const num = Number(val)
      return isNaN(num) ? '' : `R$ ${num.toFixed(2)}`
    }
  },
  {
    name: 'vencimento',
    label: 'Vencimento',
    field: 'vencimento',
    align: 'left',
    sortable: true,
    format: val => {
      if (!val) return ''
      const d = new Date(val)
      if (isNaN(d)) return val
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }
  },
  {
    name: 'pago',
    label: 'Pago?',
    field: 'pago',
    align: 'left',
    sortable: true,
    format: v => (v === 'S' ? 'Sim' : 'Não')
  }
]

const rowActions = [
  {
    label: 'Marcar como pago',
    icon: 'check',
    color: 'positive',
    show: row => row.pago !== 'S',
    handler: async row => {
      try {
        await OrdemPag.update({ ...row, pago: 'S' })
        $q.notify({ type: 'positive', message: `Pagamento #${row.id} marcado como pago.` })
        consultaRef.value?.reload?.()
      } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Erro ao marcar como pago. ' + (err?.response?.data || '') })
      }
    }
  },
  {
    label: 'Estornar',
    icon: 'undo',
    color: 'negative',
    show: row => row.pago === 'S',
    handler: async row => {
      try {
        await OrdemPag.update({ ...row, pago: 'N' })
        $q.notify({ type: 'positive', message: `Pagamento #${row.id} estornado.` })
        consultaRef.value?.reload?.()
      } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Erro ao estornar pagamento.' })
      }
    }
  }
]
</script>
