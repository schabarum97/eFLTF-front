<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated class="bg-dark-green text-white">
      <q-toolbar>

        <!-- Botão menu -->
        <q-btn
          flat dense round icon="menu" aria-label="Menu"
          class="text-white"
          @click="toggleLeftDrawer"
        />

        <!-- Título -->
        <div class="column">
          <q-toolbar-title class="text-h6 q-pa-none">{{ pageTitle }}</q-toolbar-title>
          <q-breadcrumbs class="text-white text-caption" active-color="white" gutter="xs">
            <q-breadcrumbs-el v-for="(bc, i) in breadcrumbs" :key="i" :label="bc" />
          </q-breadcrumbs>
        </div>
        <q-space />
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer
      v-model="leftDrawerOpen"
      :mini="miniState"
      :breakpoint="1024"
      show-if-above
      bordered
      class="bg-grey-1"
      @mouseover="miniState = false"
      @mouseout="miniState = $q.screen.gt.sm"
    >
      <q-scroll-area class="fit">
        <q-list padding>

          <!-- HOME -->
          <q-item
            clickable v-ripple
            :active="isActive('/')"
            active-class="active-link"
            @click="go('/')"
          >
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Início</q-item-section>
          </q-item>

          <q-separator spaced />
          <!-- Seção Consultas -->
          <q-expansion-item
            icon="search"
            label="Consultas"
            default-opened
            expand-separator
            dense
            header-class="section-header"
          >
            <template #header>
              <q-item-section avatar><q-icon name="search" /></q-item-section>
              <q-item-section>Consultas</q-item-section>
            </template>

            <q-item
              v-for="link in systemLinks.consultas"
              :key="link.title"
              clickable v-ripple
              :active="isActive(link.link)"
              active-class="active-link"
              @click="go(link.link)"
            >
              <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
              <q-item-section>{{ link.title }}</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- Seção Cadastros -->
          <q-expansion-item
            icon="edit"
            label="Cadastros"
            expand-separator
            dense
            header-class="section-header"
          >
            <template #header>
              <q-item-section avatar><q-icon name="edit" /></q-item-section>
              <q-item-section>Cadastros</q-item-section>
            </template>

            <q-item
              v-for="link in systemLinks.cadastros"
              :key="link.title"
              clickable v-ripple
              :active="isActive(link.link)"
              active-class="active-link"
              @click="go(link.link)"
            >
              <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
              <q-item-section>{{ link.title }}</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- Seção Agenda -->
          <q-expansion-item
            icon="calendar_today"
            label="Agenda"
            expand-separator
            dense
            header-class="section-header"
          >
            <template #header>
              <q-item-section avatar><q-icon name="calendar_today" /></q-item-section>
              <q-item-section>Agenda</q-item-section>
            </template>

            <q-item
              v-for="link in systemLinks.agenda"
              :key="link.title"
              clickable v-ripple
              :active="isActive(link.link)"
              active-class="active-link"
              @click="go(link.link)"
            >
              <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
              <q-item-section>{{ link.title }}</q-item-section>
            </q-item>
          </q-expansion-item>

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- PÁGINA -->
    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

defineOptions({ name: 'MainLayout' })

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// Título
const pageTitle = computed(() =>
  route.matched.at(-1)?.meta?.title || route.name || 'eFLTF'
)

const breadcrumbs = computed(() =>
  route.matched
    .slice(0, -1) // remove a última (rota atual)
    .map(m => m.meta?.title || m.name)
    .filter(Boolean)
)

// Drawer
const leftDrawerOpen = ref(false)
const miniState = ref($q.screen.gt.sm)
function toggleLeftDrawer () {
  if ($q.screen.gt.sm) miniState.value = !miniState.value
  else leftDrawerOpen.value = !leftDrawerOpen.value
}

function go (to) {
  if (!to) return
  if (route.path !== to) router.push(to)
  if (!$q.screen.gt.sm) leftDrawerOpen.value = false
}

function isActive (to) {
  if (!to) return false
  return route.path === to || route.path.startsWith(to + '/')
}

// links
const systemLinks = {
  consultas: [
    { title: 'Consulta Ordens', icon: 'person_search', link: '/consultaordem' },
    { title: 'Consulta Pagamentos', icon: 'account_balance_wallet', link: '/consultapagamento' }
  ],
  cadastros: [
    { title: 'UF', icon: 'public', link: '/uf' },
    { title: 'Status', icon: 'flag', link: '/status' },
    { title: 'Cidade', icon: 'location_city', link: '/cidade' },
    { title: 'Cliente', icon: 'people', link: '/cliente' },
    { title: 'Endereço', icon: 'place', link: '/endereco' },
    { title: 'Forma de pagamento', icon: 'credit_card', link: '/formapag' },
    { title: 'Responsável', icon: 'person', link: '/responsavel' },
    { title: 'Veículo', icon: 'local_shipping', link: '/veiculo' },
    { title: 'Ordem Serviço', icon: 'receipt_long', link: '/ordemfull' }
  ],
  agenda: [
    { title: 'Agenda de serviços', icon: 'local_shipping', link: '/servicos' }
  ]
}
</script>

<style scoped>
.bg-dark-green { background-color: #1b3a2a; }
.q-page-container { padding: 16px; }

.section-header {
  color: #1b3a2a;
  font-weight: 600;
}

.active-link {
  background: rgba(27, 58, 42, 0.08);
  border-left: 3px solid #1b3a2a;
}

:deep(.q-drawer--mini) .q-item__section--avatar + .q-item__section {
  display: none;
}
</style>
