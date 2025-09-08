<template>
  <q-page class="full-height">
    <CRUDPage
      :service="Cidade"
      :formFields="formFields"
      :columns="columns"
    />
  </q-page>
</template>

<script setup>
import CRUDPage from 'src/components/CRUDPage.vue'
import { Cidade } from 'src/services/CidadeService.js'
import { Uf } from 'src/services/UfService.js'

const formFields = [
  { model: 'nome', label: 'Nome da Cidade', required: true, type: 'text' },
  { model: 'deslocamento', label: 'Tempo deslocamento', required: true, type: 'number' },
    {
    model: 'uf_id',
    label: 'UF',
    type: 'lookup',
    optionLabel: 'label',
    optionValue: 'value',

    async fetchOptions (term) {
      const { items } = await Uf.getAll({ q: term })
      return items.map(u => ({ label: `${u.sigla} – ${u.nome}`, value: u.id }))
    },

    composeLabelFrom: ['uf_sigla', 'uf_nome'],
    composeSeparator: ' – ',

    async resolveOption (id) {
      const { item } = await Uf.getById(id)
      return { label: `${item.sigla} – ${item.nome}`, value: item.id }
    }
  }
]

const columns = [
  { name: 'id',       label: 'Código',  field: 'id' },
  { name: 'nome',     label: 'Cidade',  field: 'nome' },
  { name: 'deslocamento', label: 'Tempo deslocamento',      field: 'deslocamento' },
  { name: 'uf_sigla', label: 'UF',      field: 'uf_sigla' },
  { name: 'uf_nome',  label: 'UF Nome', field: 'uf_nome' }
]
</script>
