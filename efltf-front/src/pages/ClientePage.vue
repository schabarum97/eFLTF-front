<template>
  <q-page class="full-height">
    <CRUDPage
      :service="Cliente"
      :formFields="formFields"
      :columns="columns"
    />
  </q-page>
</template>

<script setup>
import CRUDPage from 'src/components/CRUDPage.vue'
import { Cliente } from 'src/services/ClienteService.js'

const formFields = [
  { model: 'cnpj', label: 'CPF/CNPJ', type: 'text', maxlength: 18 },
  { model: 'nome', label: 'Nome', type: 'text', required: true, maxlength: 200 },
  { model: 'ddi',  label: 'DDI',  type: 'tel', maxlength: 4 },
  { model: 'ddd',  label: 'DDD',  type: 'tel', maxlength: 3 },
  { model: 'fone', label: 'Telefone', type: 'tel', maxlength: 20 }
]

const columns = [
  { name: 'id', label: 'Código', field: 'id' },
  { name: 'cnpj', label: 'CPF/CNPJ', field: 'cnpj' },
  { name: 'nome', label: 'Nome', field: 'nome' },
  { name: 'ddi', label: 'DDI', field: 'ddi' },
  { name: 'ddd', label: 'DDD', field: 'ddd' },
  { name: 'fone', label: 'Telefone',field: 'fone' }
]
</script>
