<template>
  <q-page class="full-height">
    <CRUDPage
      :service="EnderecoAdapter"
      :formFields="formFields"
      :columns="columns"
    />
  </q-page>
</template>

<script setup>
import CRUDPage from 'src/components/CRUDPage.vue'
import { Endereco } from 'src/services/EnderecoService.js'
import { Cliente } from 'src/services/ClienteService.js'
import { Cidade } from 'src/services/CidadeService.js'

function normalizeEnderecoForForm (item) {
  if (!item) return item
  return {
    ...item,
    // duplica campos do GET (aliases do back) para os nomes que o form usa
    cli_logradouro: item.cli_logradouro ?? item.logradouro ?? '',
    cli_numero:     item.cli_numero     ?? item.numero     ?? '',
    cli_bairro:     item.cli_bairro     ?? item.bairro     ?? '',
    cli_endereco:   item.cli_endereco   ?? item.endereco   ?? '',
    cli_cep:        item.cli_cep        ?? item.cep        ?? '',
    cli_ativo:      item.cli_ativo      ?? item.ativo      ?? 'S'
  }
}

const EnderecoAdapter = {
  async getAll () {
    const data = await Endereco.getAll()
    const raw = data.items ?? data.enderecos ?? []
    const items = raw.map(normalizeEnderecoForForm)
    return { total: data.total ?? items.length, items }
  },
  async getById (id) {
    const data = await Endereco.getById(id)
    const item = normalizeEnderecoForForm(data.item ?? data.endereco)
    return { total: data.total ?? (item ? 1 : 0), item }
  },
  // create/update/delete passam direto — o form já usa os nomes cli_* que o back espera
  create: (payload) => Endereco.create(payload),
  update: (payload) => Endereco.update({ id: payload.id, ...payload }),
  delete: (id) => Endereco.delete(id)
}

const formFields = [
  {
    model: 'cli_id',
    label: 'Cliente',
    type: 'lookup',
    required: true,
    optionLabel: 'label',
    optionValue: 'id',

    async fetchOptions (term) {
      const data = await Cliente.getAll()
      const arr = (data.items ?? data.clientes ?? [])
      let list = arr.map(c => ({
        id: c.id ?? c.cli_id,
        label: (c.nome ?? c.cli_nome) || `#${c.id ?? c.cli_id}`
      }))
      if (term) {
        const t = String(term).toLowerCase()
        list = list.filter(o => o.label?.toLowerCase().includes(t))
      }
      return list
    },

    composeLabelFrom: ['cliente_nome', ''],
    composeSeparator: ' ',

    async resolveOption (id) {
      const { item } = await Cliente.getById(id)
      return { id: item.id ?? item.cli_id, label: item.nome ?? item.cli_nome }
    }
  },
  {
    model: 'cid_id',
    label: 'Cidade',
    type: 'lookup',
    required: true,
    optionLabel: 'label',
    optionValue: 'id',

    async fetchOptions (term /*, _update, _abort, formModel */) {
      const data = await Cidade.getAll()
      const arr = (data.items ?? data.cidades ?? [])
      let list = arr.map(c => ({
        id: c.id ?? c.cid_id,
        label: `${(c.uf_sigla ?? '').toString()} — ${(c.nome ?? c.cid_nome).toString()}`,
        nome: c.nome ?? c.cid_nome,
        uf_sigla: c.uf_sigla
      }))
      if (term) {
        const t = String(term).toLowerCase()
        list = list.filter(o => o.label?.toLowerCase().includes(t))
      }
      return list
    },

    composeLabelFrom: ['nome', 'uf_sigla'],
    composeSeparator: ' — ',

    async resolveOption (id) {
      const { item } = await Cidade.getById(id)
      const nome = item.nome ?? item.cid_nome
      const sigla = item.uf_sigla ?? item.uf?.sigla
      return { id: item.id ?? item.cid_id, label: `${(sigla ?? '').toString()} — ${nome.toString()}` }
    }
  },
  { model: 'cli_logradouro', label: 'Logradouro',  type: 'text', required: true, maxlength: 200 },
  { model: 'cli_numero', label: 'Número',  type: 'text', maxlength: 20 },
  { model: 'cli_bairro', label: 'Bairro', type: 'text', maxlength: 120 },
  { model: 'cli_endereco', label: 'Complemento', type: 'text', maxlength: 200 },
  { model: 'cli_cep', label: 'CEP', type: 'text', maxlength: 9 },
  {
    model: 'cli_ativo',
    label: 'Ativo',
    type: 'select',
    required: true,
    options: [
      { label: 'Sim', value: 'S' },
      { label: 'Não', value: 'N' }
    ]
  }
]

const columns = [
  { name: 'id', label: 'Código', field: 'id' },
  { name: 'cliente', label: 'Cliente', field: 'cliente_nome' },
  { name: 'cidade', label: 'Cidade', field: 'cidade_nome' },
  { name: 'logradouro', label: 'Logradouro', field: 'logradouro' },
  { name: 'numero', label: 'Número', field: 'numero' },
  { name: 'bairro', label: 'Bairro', field: 'bairro' },
  { name: 'endereco', label: 'Compl.', field: 'endereco' },
  { name: 'cep', label: 'CEP', field: 'cep' },
  { name: 'ativo', label: 'Ativo', field: 'ativo' }
]
</script>
