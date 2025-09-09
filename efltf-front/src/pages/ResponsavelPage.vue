<template>
  <q-page class="full-height">
    <CRUDPage
      :service="Responsavel"
      :formFields="[
        { model: 'nome', label: 'Nome do Responsável', required: true }
      ]"
      :columns="[
        { name: 'id',   label: 'Código', field: 'id' },
        { name: 'nome', label: 'Nome',   field: 'nome' }
      ]"
      title="Usuários Responsáveis"
    />
  </q-page>
</template>

<script>
import CRUDPage from 'src/components/CRUDPage.vue'
import { Responsavel } from 'src/services/ResponsavelService.js'

export default {
  name: 'ResponsavelPage',
  components: { CRUDPage },
  data () {
    return { Responsavel }
  }
}
</script>
