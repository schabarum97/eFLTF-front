<template>
  <q-page class="full-height">
    <CRUDPage
      :service="Responsavel"
      :formFields="formFields"
      :columns="columns"
      title="Usuários Responsáveis"
    />
  </q-page>
</template>

<script setup>
import CRUDPage from 'src/components/CRUDPage.vue'
import { Responsavel } from 'src/services/ResponsavelService.js'

const formFields = [
  { model: 'nome',  label: 'Nome do Responsável',  type: 'text', required: true, maxlength: 100 },
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
  }
]

const columns = [
  { name: 'id', label: 'Código', field: 'id' },
  { name: 'nome', label: 'Nome Responsável',  field: 'nome' },
  { name: 'ativo', label: 'Ativo',  field: 'ativo', format: v => (v === 'S' ? 'Sim' : 'Não') }
]
</script>
