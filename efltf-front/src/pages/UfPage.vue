<template>
  <q-page class="full-height">
    <CRUDPage
      :service="Uf"
      :formFields="[
        { model: 'nome', label: 'Nome da UF', required: true },
        { model: 'sigla', label: 'Sigla da UF', maxlength: 2, required: true }
      ]"
      :columns="[
        { name: 'id', label: 'Código', field: 'id' },
        { name: 'nome', label: 'Nome', field: 'nome' },
        { name: 'sigla', label: 'Sigla', field: 'sigla' }
      ]"
    />
  </q-page>
</template>

<script>
import CRUDPage from 'src/components/CRUDPage.vue'
import { Uf } from 'src/services/UfService.js'

export default {
  name: 'UfPage',
  components: {
    CRUDPage
  },
  data() {
    return {
      Uf
    }
  }
}
</script>
