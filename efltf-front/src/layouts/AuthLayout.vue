<template>
  <q-layout view="lHh Lpr lFf" :class="['app-layout', { 'auth-bg': isAuthPage }]">
    <q-header v-if="!isAuthPage" class="bg-primary text-white" elevated>
      <q-toolbar>
        <q-toolbar-title class="row items-center q-gutter-sm">
          <q-avatar color="white" text-color="primary" size="28px" font-size="18px">e</q-avatar>
          <span>eFLTF</span>
        </q-toolbar-title>

        <q-space />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()

// auth pages: colocamos meta: { authPage: true } nas rotas de /login e /signup
const isAuthPage = computed(() => route.meta?.authPage === true)

</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

/* Fundo especial nas telas de auth */
.auth-bg {
  /* gradiente suave; usa primary por padrão */
  background: linear-gradient(135deg, var(--q-primary) 0%, #4f46e5 50%, #0ea5e9 100%);
}

/* ajuste para dark mode em auth */
:deep(body.body--dark) .auth-bg {
  background: linear-gradient(135deg, #0b1020 0%, #141a2f 50%, #0e7490 100%);
}
</style>
