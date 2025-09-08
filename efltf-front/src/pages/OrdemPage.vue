<!-- src/pages/OrdemPage.vue -->
<template>
  <q-page class="full-height">
    <CRUDPage
      :service="Ordem"
      :formFields="formFields"
      :columns="columns"
    />
  </q-page>
</template>

<script setup>
import CRUDPage from 'src/components/CRUDPage.vue'
import { Ordem } from 'src/services/OrdemService.js'
import { Cliente } from 'src/services/ClienteService.js'
import { Endereco } from 'src/services/EnderecoService.js'
import { Status } from 'src/services/StatusService.js'
//import { Usuario } from 'src/services/UsuarioService.js'

const formFields = [
  {
    model: 'cli_id',
    label: 'Cliente',
    type: 'lookup',
    optionLabel: 'label',
    optionValue: 'value',

    async fetchOptions (term) {
      const { items } = await Cliente.getAll({ q: term })
      return items.map(c => ({
        label: `${c.id} – ${c.nome}`,
        value: c.id
      }))
    },

    composeLabelFrom: ['cli_id', 'cliente_nome'],
    composeSeparator: ' – ',

    async resolveOption (id) {
      if (!id) return null
      const { item } = await Cliente.getById(id)
      return { label: `${item.id} – ${item.nome}`, value: item.id }
    }
  },

  {
    model: 'end_id',
    label: 'Endereço',
    type: 'lookup',
    optionLabel: 'label',
    optionValue: 'value',
    dependsOn: 'cli_id',

    async fetchOptions (term, ctx) {
      const cliId = ctx?.formData?.cli_id
      if (!cliId) return []
      const { items } = await Endereco.getAll({ q: term, cli_id: cliId })
      // reforço do filtro no front (se o back ainda não aplica)
      const filtered = items.filter(e => e.cli_id == null || e.cli_id === cliId)
      return filtered.map(e => ({
        label: `${e.id} – ${e.logradouro}, ${e.numero}${e.bairro ? ' - ' + e.bairro : ''}`,
        value: e.id
      }))
    },

    composeLabelFrom: ['end_id', 'end_logradouro', 'end_numero', 'end_bairro'],
    composeSeparator: ' – ',

    async resolveOption (id, ctx) {
      if (!id) return null
      const { item } = await Endereco.getById(id)
      const cliId = ctx?.formData?.cli_id
      // BLOQUEIO: se o endereço não pertence ao cliente atual, invalida
      if (cliId && item?.cli_id && item.cli_id !== cliId) {
        return null
      }
      return {
        label: `${item.id} – ${item.logradouro}, ${item.numero}${item.bairro ? ' - ' + item.bairro : ''}`,
        value: item.id
      }
    }
  },

  {
    model: 'stt_id',
    label: 'Status',
    type: 'lookup',
    optionLabel: 'label',
    optionValue: 'value',

    async fetchOptions (term) {
      const { items } = await Status.getAll({ q: term })
      return items.map(s => ({ label: s.nome, value: s.id }))
    },

    composeLabelFrom: ['status_nome'],
    composeSeparator: ' – ',

    async resolveOption (id) {
      if (!id) return null
      const { item } = await Status.getById(id)
      return { label: item.nome, value: item.id }
    }
  },

  {
    model: 'observacao',
    label: 'Observação',
    type: 'textarea',
    maxlength: 500
  },
  
  {
    model: 'data',
    label: 'Data',
    type: 'date'
  },

  {
    model: 'hora',
    label: 'Hora',
    type: 'time'
  },

  /*{
    model: 'responsavel_id',
    label: 'Responsável',
    type: 'lookup',
    optionLabel: 'label',
    optionValue: 'value',
    async fetchOptions (term) {
      const { items } = await Usuario.getAll({ q: term, onlyActive: true })
      return items.map(u => ({ label: u.nome, value: u.id }))
    },
    async resolveOption (id) {
      if (!id) return null
      const { item } = await Usuario.getById(id)
      if (item?.ativo === false) return null
      return { label: item.nome, value: item.id }
    }
  }*/
]

const columns = [
  { name: 'id',               label: 'Código',        field: 'id' },
  { name: 'cliente_nome',     label: 'Cliente',       field: 'cliente_nome' },
  { name: 'end_id',           label: 'Endereço',      field: 'end_id' },
  { name: 'status_nome',      label: 'Status',        field: 'status_nome' },
  { name: 'data',             label: 'Data',          field: 'data' },
  { name: 'hora',             label: 'Hora',          field: 'hora' },
  { name: 'responsavel_nome', label: 'Responsável',   field: 'responsavel_nome' }
]
</script>
