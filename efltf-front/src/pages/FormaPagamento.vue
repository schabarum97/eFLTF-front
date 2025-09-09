<template>
  <q-page class="full-height">
    <CRUDPage
      :service="FormaPag"
      :formFields="formFields"
      :columns="columns"
    />
  </q-page>
</template>

<script setup>
import CRUDPage from 'src/components/CRUDPage.vue'
import { FormaPag } from 'src/services/FormaPagService.js'

const formFields = [
  { model: 'nome', label: 'Nome da Forma de Pagamento', required: true, type: 'text' },
  {
    model: 'ativo',
    label: 'Ativo',
    type: 'select',
    required: true,
    options: [
      { label: 'Sim', value: 'S' },
      { label: 'Não', value: 'N' }
    ],
    default: 'S'
  },
  {
    model: 'parcelado',
    label: 'Aceita Parcelamento',
    type: 'select',
    required: true,
    options: [
      { label: 'Sim', value: 'S' },
      { label: 'Não', value: 'N' }
    ],
    default: 'N'
  }
]

const columns = [
  { name: 'id', label: 'Código', field: 'id' },
  { name: 'nome', label: 'Forma de Pagamento', field: 'nome' },
  { name: 'ativo', label: 'Ativo', field: 'ativo', format: v => (v === 'S' ? 'Sim' : 'Não') },
  { name: 'parcelado', label: 'Parcelado', field: 'parcelado',  format: v => (v === 'S' ? 'Sim' : 'Não') }
]
</script>
