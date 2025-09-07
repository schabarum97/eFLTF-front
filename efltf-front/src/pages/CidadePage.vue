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
  {
    model: 'uf_id',
    label: 'UF',
    type: 'lookup',
    required: true,
    optionLabel: 'label',   // o dropdown mostra "SIGLA — Nome"
    optionValue: 'id',      // o form salva o ID
    async fetchOptions (term) {
      const data = await Uf.getAll() // já existe no teu adapter
      const arr = (data.items ?? data.ufs ?? [])
      const list = arr.map(u => {
        const id = u.id ?? u.uf_id
        const nome = u.nome ?? u.uf_nome
        const sigla = u.sigla ?? u.uf_sigla
        return { id, label: `${sigla} — ${nome}` }
      })
      if (!term) return list
      const t = String(term).toLowerCase()
      return list.filter(o => o.label.toLowerCase().includes(t))
    }
  }
]

const columns = [
  { name: 'id',       label: 'Código',  field: 'id' },
  { name: 'nome',     label: 'Cidade',  field: 'nome' },
  { name: 'uf_sigla', label: 'UF',      field: 'uf_sigla' },
  { name: 'uf_nome',  label: 'UF Nome', field: 'uf_nome' }
]
</script>
