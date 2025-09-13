<template>
  <q-page class="full-height">
    <CRUDPage
      :service="TipoLocal"
      :formFields="formFields"
      :columns="columns"
    />
  </q-page>
</template>

<script setup>
import CRUDPage from 'src/components/CRUDPage.vue'
import { TipoLocal } from 'src/services/TipoLocalService.js'

const formFields = [
  { model: 'nome',  label: 'Nome do Tipo', type: 'text', required: true, maxlength: 80 },
  { model: 'valor', label: 'Valor (R$)',   type: 'number', step: '0.01', min: 0 },
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

const fmtBRL = (v) => {
  if (v === null || v === undefined || v === '') return 'a definir no ato'
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const columns = [
  { name: 'id',    label: 'Código',        field: 'id' },
  { name: 'nome',  label: 'Nome',          field: 'nome' },
  { name: 'valor', label: 'Valor (R$)',    field: 'valor', format: fmtBRL },
  { name: 'ativo', label: 'Ativo',         field: 'ativo' }
]
</script>
