<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated class="app-header bg-dark-green text-white">
      <q-toolbar>

        <!-- Botão menu -->
        <q-btn
          flat dense round icon="menu" aria-label="Menu"
          class="text-white"
          @click="toggleLeftDrawer"
        />

        <!-- Título + breadcrumbs -->
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

          <!-- ====== CONSULTAS (grupo vivo) ====== -->
          <div class="group-block">
            <q-expansion-item
              expand-icon="expand_more"
              default-opened
              dense
              expand-separator
              header-class="group-header"
              content-class="group-content"
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
          </div>

          <!-- ====== CADASTROS (grupo vivo) ====== -->
          <div class="group-block">
            <q-expansion-item
              expand-icon="expand_more"
              dense
              expand-separator
              header-class="group-header"
              content-class="group-content"
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
          </div>

          <!-- ====== AGENDA (grupo vivo) ====== -->
          <div class="group-block">
            <q-expansion-item
              expand-icon="expand_more"
              dense
              expand-separator
              header-class="group-header"
              content-class="group-content"
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
          </div>

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
    .slice(0, -1)
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
    { title: 'Consulta Pagamentos', icon: 'account_balance_wallet', link: '/consultapagamento' },
    { title: 'Report OS', icon: 'print', link: '/report' }
  ],
  cadastros: [
    { title: 'UF', icon: 'public', link: '/uf' },
    { title: 'Status', icon: 'flag', link: '/status' },
    { title: 'Cidade', icon: 'location_city', link: '/cidade' },
    { title: 'Cliente', icon: 'people', link: '/cliente' },
    { title: 'Endereço', icon: 'place', link: '/endereco' },
    { title: 'Forma de pagamento', icon: 'credit_card', link: '/formapag' },
    { title: 'Responsável', icon: 'person', link: '/responsavel' },
    { title: 'Veículo', icon: 'directions_car', link: '/veiculo' },
    { title: 'Ordem Serviço', icon: 'receipt_long', link: '/ordemfull' }
  ],
  agenda: [
    { title: 'Agenda de serviços', icon: 'schedule', link: '/servicos' },
    { title: 'Disponibilidade de veículos', icon: 'local_shipping', link: '/disponibilidade' }
  ]
}
</script>

<style scoped>
/* ====== Header ====== */
.bg-dark-green { background-color: #1b3a2a; }
.q-page-container { padding: 16px; }

/* Remove qualquer “hairline” e dá uma sombra mais bonita */
.app-header {
  border-bottom: 0 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.18);
}
.app-header :deep(.q-toolbar) {
  border-bottom: 0;
}

/* ====== Drawer links ====== */
.section-header {
  color: #1b3a2a;
  font-weight: 600;
}

/* Itens ativos com faixinha à esquerda */
.active-link {
  background: rgba(27, 58, 42, 0.08);
  border-left: 3px solid #1b3a2a;
}

/* Mini: esconde texto mantendo só o ícone */
:deep(.q-drawer--mini) .q-item__section--avatar + .q-item__section {
  display: none;
}

/* ====== “Blocos vivos” (cards dos grupos) ====== */
.group-block {
  margin: 8px 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e6e6e6;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  overflow: hidden;
}

/* Cabeçalho do grupo */
.group-header {
  color: #1b3a2a;
  font-weight: 700;
  background: linear-gradient(180deg, #f9fafb, #f2f4f7);
}

/* Quando expandido, reforça o “grupo vivo” */
:deep(.q-expansion-item--expanded) .group-header {
  background: #eef6f1;
  border-bottom: 1px dashed #c9d8d0;
}

/* Conteúdo do grupo (itens) */
.group-content {
  padding: 4px 0;
}
.group-content .q-item {
  padding-left: 48px; /* dá respiro para alinhar com o ícone do header */
}
.group-content .q-item:hover {
  background: #f5f9f7;
}
.group-content .q-item .q-item__section--avatar .q-icon {
  opacity: .9;
}
</style>
