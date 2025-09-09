<template>
  <q-page class="full-height">
    <CRUDPage
      :service="Veiculo"
      :formFields="formFields"
      :columns="columns"
    />
  </q-page>
</template>

<script setup>
import CRUDPage from 'src/components/CRUDPage.vue'
import { Veiculo } from 'src/services/VeiculoService.js'

const formFields = [
  { model: 'placa',  label: 'Placa',  type: 'text', required: true, maxlength: 10, placeholder: 'ABC1D23 ou AAA-1234' },
  { model: 'modelo', label: 'Modelo', type: 'text', required: true, maxlength: 100 },
  { model: 'marca',  label: 'Marca',  type: 'text', required: true, maxlength: 100 },
  { model: 'ano',    label: 'Ano',    type: 'number', required: true, min: 1900, max: 2099, step: 1 },
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
  { name: 'id',     label: 'Código', field: 'id' },
  { name: 'placa',  label: 'Placa',  field: 'placa' },
  { name: 'modelo', label: 'Modelo', field: 'modelo' },
  { name: 'marca',  label: 'Marca',  field: 'marca' },
  { name: 'ano',    label: 'Ano',    field: 'ano' },
  { name: 'ativo',  label: 'Ativo',  field: 'ativo', format: v => (v === 'S' ? 'Sim' : 'Não') }
]
</script>
