<template>
  <q-page class="full-height">
    <CRUDPage
      :service="Status"
      :formFields="formFields"
      :columns="columns"
    />
  </q-page>
</template>

<script setup>
import CRUDPage from 'src/components/CRUDPage.vue'
import { Status } from 'src/services/StatusService.js'

// Definir as props no script evita parsing chato no template
const formFields = [
  { model: 'nome', label: 'Nome do Status', required: true, type: 'text' },
  { model: 'cor',  label: 'Cor', required: true, type: 'color', format: 'hex' }
]


const columns = [
  { name: 'id',   label: 'Código', field: 'id' },
  { name: 'nome', label: 'Nome',   field: 'nome' },
  { name: 'cor',  label: 'Cor',    field: 'cor' }
]
</script>
