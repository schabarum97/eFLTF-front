<template>
  <q-page class="q-pa-none bg-grey-2">
    <div class="no-print q-pa-sm row items-center justify-between bg-white shadow-1">
      <div class="row items-center q-gutter-sm">
        <q-btn flat dense icon="arrow_back" label="Voltar" @click="$router.back()" />
      </div>

      <div class="row items-center q-gutter-sm">
        <q-input
          v-model.number="inputId"
          dense
          outlined
          type="number"
          min="1"
          style="width: 180px"
          placeholder="ID da OS"
          @keyup.enter="loadById"
        >
          <template #prepend><q-icon name="tag" /></template>
        </q-input>

        <q-btn color="secondary" icon="search" label="Carregar" @click="loadById" no-caps />
        <q-btn color="primary" icon="print" label="Imprimir / PDF" @click="printNow" no-caps />
      </div>
    </div>

    <!-- PAPEL A4 -->
    <div class="paper">
      <div v-if="loading" class="q-pa-md">Carregando…</div>
      <div v-else-if="error" class="q-pa-md text-negative">{{ error }}</div>

      <div v-else-if="vm" class="report">
        <!-- Cabeçalho -->
        <header class="rep-header">
          <div class="brand" v-if="vm.brand">
            <div class="brand-top">
              <!-- LOGO -->
              <img
                v-if="logoSrc"
                :src="logoSrc"
                alt="Logo"
                class="brand-logo"
              />
              <div class="brand-text">
                <div class="brand-name">{{ vm.brand.name }}</div>
                <div class="brand-sub" v-if="vm.brand.cnpj">CNPJ: {{ vm.brand.cnpj }}</div>
                <div class="brand-sub" v-if="vm.brand.address">{{ vm.brand.address }}</div>
                <div class="brand-sub" v-if="vm.brand.phone || vm.brand.email">
                  {{ vm.brand.phone }} <span v-if="vm.brand.phone && vm.brand.email"> • </span> {{ vm.brand.email }}
                </div>
              </div>
            </div>
          </div>

          <div class="title-box">
            <div class="title">Ordem de Serviço</div>
            <div class="subtitle">#{{ vm.header?.ord_id || inputId }}</div>
            <div :class="['pill', statusClass]" v-if="vm.header?.status">{{ vm.header.status }}</div>
          </div>
        </header>

        <!-- Dados principais -->
        <section class="grid-2 section">
          <div>
            <h4>Cliente</h4>
            <div class="kv"><b>Nome:</b><span>{{ vm.customer?.nome || '' }}</span></div>
            <div class="kv" v-if="vm.customer?.doc"><b>Documento:</b><span>{{ vm.customer.doc }}</span></div>
            <div class="kv" v-if="vm.customer?.contato"><b>Contato:</b><span>{{ vm.customer.contato }}</span></div>
          </div>
          <div>
            <h4>Programação</h4>
            <div class="kv"><b>Data:</b><span>{{ vm.header?.dataBR || '' }}</span></div>
            <div class="kv"><b>Hora:</b><span>{{ vm.header?.hora || '' }}</span></div>
            <div class="kv" v-if="vm.order?.responsavel?.nome"><b>Responsável:</b><span>{{ vm.order.responsavel.nome }}</span></div>
            <div class="kv" v-if="vm.order?.veiculo?.line"><b>Veículo:</b><span>{{ vm.order.veiculo.line }}</span></div>
          </div>
        </section>

        <section class="section">
          <h4>Endereço do Serviço</h4>
          <div>{{ vm.address?.line || '' }}</div>
        </section>

        <section v-if="vm.order?.observacao" class="section">
          <h4>Observações</h4>
          <div class="obs">{{ vm.order.observacao }}</div>
        </section>

        <!-- Pagamentos -->
        <section class="section">
          <div class="row-between">
            <h4 class="no-margin">Pagamentos</h4>
            <div class="totals">
              <div><b>Total:</b> {{ vm.payments?.totals?.total_fmt || 'R$ 0,00' }}</div>
              <div><b>Pago:</b> {{ vm.payments?.totals?.pago_fmt || 'R$ 0,00' }}</div>
              <div><b>Em aberto:</b> {{ vm.payments?.totals?.aberto_fmt || 'R$ 0,00' }}</div>
            </div>
          </div>

          <table class="tbl">
            <thead>
              <tr>
                <th style="width: 60px">#</th>
                <th>Forma</th>
                <th style="width: 140px">Vencimento</th>
                <th style="width: 140px">Valor</th>
                <th style="width: 100px">Pago</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in (vm.payments?.items || [])" :key="p.id">
                <td class="text-center">#{{ p.parcela }}</td>
                <td>{{ p.forma }}</td>
                <td>{{ p.vencimentoBR }}</td>
                <td class="text-right">{{ p.valor_fmt }}</td>
                <td class="text-center">{{ p.pago === 'S' ? 'Sim' : 'Não' }}</td>
              </tr>
              <tr v-if="!(vm.payments?.items || []).length">
                <td colspan="5" class="text-center text-grey">Sem parcelas cadastradas</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Assinaturas / rodapé -->
        <section class="signatures section">
          <div class="sig">
            <div class="line"></div>
            <div class="label">{{ vm.footer?.signatures?.cliente?.label || 'Assinatura do Cliente' }}</div>
          </div>
          <div class="sig">
            <div class="line"></div>
            <div class="label">{{ vm.footer?.signatures?.empresa?.label || 'Assinatura da Empresa' }}</div>
          </div>
        </section>

        <footer class="rep-footer">
          <div class="terms" v-for="(t,i) in (vm.footer?.terms || [])" :key="i">• {{ t }}</div>
          <div class="gen">Gerado em {{ vm.meta?.generatedAtBR || '' }}</div>
        </footer>
      </div>

      <div v-else class="q-pa-md text-grey">
        Informe o <b>ID da OS</b> acima e clique em <b>Carregar</b>.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Report } from 'src/services/ReportService'

import DefaultLogo from 'src/assets/LOGO.png'

/**
 * ATUALIZAÇÃO: troca "as: 'url'" por "query: '?url', import: 'default'"
 * para eliminar o warning de depreciação do Vite.
 */
const ASSET_URLS = import.meta.glob(
  'src/assets/**/*.{png,jpg,jpeg,svg,webp}',
  { eager: true, query: '?url', import: 'default' }
)

const route = useRoute()
const router = useRouter()

const vm = ref(null)
const loading = ref(true)
const error = ref(null)
const inputId = ref(route.params?.id ? Number(route.params.id) : null)

const statusClass = computed(() => {
  const s = (vm.value?.header?.status || '').toUpperCase()
  if (s.includes('CANCEL')) return 'pill-cancel'
  if (s.includes('FECH') || s.includes('CONCLU')) return 'pill-done'
  if (s.includes('ABER')) return 'pill-open'
  return 'pill-default'
})

function resolveAssetFromSrcAssets(pathOrName) {
  if (!pathOrName) return DefaultLogo
  const p = String(pathOrName).trim()
  if (/^(https?:|data:|\/)/i.test(p)) return p
  const cleaned = p.replace(/\\/g, '/')
  const entry = Object.entries(ASSET_URLS).find(([k]) =>
    k.endsWith(cleaned) || k.endsWith('/' + cleaned)
  )
  return entry ? entry[1] : DefaultLogo
}

const logoSrc = computed(() => resolveAssetFromSrcAssets(vm.value?.brand?.logoUrl))

async function fetchVM (id) {
  loading.value = true
  error.value = null
  try {
    const raw = await Report.getReport(id)
    const data = raw?.item ?? raw

    data.brand    = data.brand    || { name: '', cnpj: '', address: '', phone: '', email: '', site: '', logoUrl: null }
    data.header   = data.header   || { ord_id: id, status: '', dataBR: '', hora: '' }
    data.customer = data.customer || { nome: '', doc: '', contato: '' }
    data.address  = data.address  || { line: '' }
    data.order    = data.order    || { observacao: '', responsavel: {}, veiculo: {} }
    data.payments = data.payments || {
      items: [],
      totals: { total: 0, pago: 0, aberto: 0, total_fmt: 'R$ 0,00', pago_fmt: 'R$ 0,00', aberto_fmt: 'R$ 0,00' }
    }
    data.footer   = data.footer   || {
      signatures: { cliente: { label: 'Assinatura do Cliente' }, empresa: { label: 'Assinatura da Empresa' } },
      terms: []
    }

    vm.value = data
  } catch (e) {
    vm.value = null
    error.value = e?.message || 'Falha ao carregar relatório'
  } finally {
    loading.value = false
  }
}

function updateUrlWithId (id) {
  if (route.name) {
    try { router.replace({ name: route.name, params: { id } }); return } catch {}
  }
  if (router.hasRoute && router.hasRoute('relatorio-os')) {
    try { router.replace({ name: 'relatorio-os', params: { id } }); return } catch {}
  }
  try { router.replace({ path: `/relatorios/os/${id}` }) } catch {}
}

async function loadById () {
  const id = Number(inputId.value)
  if (!Number.isFinite(id) || id <= 0) {
    error.value = 'Informe um ID válido'
    return
  }
  await fetchVM(id)
  updateUrlWithId(id)
}

function printNow () {
  window.print()
}

onMounted(async () => {
  let id = Number(route.params?.id)
  if (id == null || !Number.isFinite(id) || id <= 0) {
    id = Number(route.query?.ord_id)
  }

  if (Number.isFinite(id) && id > 0) {
    await fetchVM(id)
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.paper{
  width: 210mm;  
  min-height: 297mm;
  margin: 12px auto;
  padding: 0;
  background: #fff;
  color: #000;
  box-shadow: 0 1px 6px rgba(0,0,0,.08);
}
.report{ padding: 16mm 12mm 18mm 12mm; }

.row-between{ display:flex; align-items:center; justify-content:space-between; gap:16px; }

h4{ margin: 0 0 6px 0; font-size: 13.5px; }
.no-margin{ margin:0; }
.text-right{ text-align:right; }
.text-center{ text-align:center; }
.text-grey{ color:#666; }
.kv{ display:grid; grid-template-columns: 110px 1fr; gap:8px; }
.kv b{ font-weight: 700; }

.rep-header{
  display:grid;
  grid-template-columns: 1fr auto;
  align-items:flex-start;
  gap:16px;
  margin-bottom:10mm;
}
.brand-top{ display:flex; align-items:flex-start; gap:12px; }
.brand-logo{ height:38px; width:auto; object-fit:contain; image-rendering: -webkit-optimize-contrast; }
.brand-name{ font-size: 16px; font-weight: 800; letter-spacing: .2px; }
.brand-sub{ font-size: 11px; color:#444; line-height: 1.25; }

.title-box{ text-align:right; }
.title{ font-size: 18px; font-weight: 800; }
.subtitle{ font-size: 13px; color:#444; }
.pill{
  display:inline-block;
  margin-top:6px;
  font-size: 11px;
  padding:3px 10px;
  border:1px solid #bbb;
  border-radius:999px;
}
.pill-open{ background:#E8F5E9; border-color:#A5D6A7; color:#2E7D32; }
.pill-done{ background:#E3F2FD; border-color:#90CAF9; color:#1565C0; }
.pill-cancel{ background:#FFEBEE; border-color:#EF9A9A; color:#C62828; }
.pill-default{ background:#F5F5F5; color:#333; }

.section{ margin-bottom: 8mm; break-inside: avoid; page-break-inside: avoid; }
.grid-2{ display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
.obs{ white-space: pre-wrap; }

.totals{
  display:flex;
  align-items:center;
  gap:16px;
  flex-wrap: wrap;
  font-size: 12px;
}
.totals > div b{ font-weight:700; }

.tbl{ width:100%; border-collapse: collapse; font-size: 12px; }
.tbl th, .tbl td{ border: 1px solid #e6e6e6; padding: 7px 9px; }
.tbl thead{ display: table-header-group; background:#fafafa; }
.tbl th{ font-weight:700; color:#333; }

.signatures{
  display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-top: 10mm;
}
.sig .line{ border-bottom: 1px solid #333; height: 28px; }
.sig .label{ font-size: 11px; color:#444; margin-top:4px; }

.rep-footer{ margin-top:10mm; font-size: 11px; color:#444; }
.terms + .terms{ margin-top:3px; }
.gen{ margin-top:6px; font-style: italic; }
</style>

<style>
@page {
  size: A4;
  margin: 16mm 12mm 18mm 12mm;
}
@media print {
  body, #q-app { background: #fff !important; }
  body * { visibility: hidden !important; }

  .paper, .paper * { visibility: visible !important; }

  .no-print,
  .q-header,
  .q-footer,
  .q-drawer,
  .q-page-sticky,
  .q-layout__section--marginal,
  .q-toolbar,
  .q-breadcrumbs { display: none !important; }

  .paper {
    position: absolute;
    left: 0; top: 0;
    margin: 0 !important;
    width: 210mm !important;
    min-height: 297mm !important;
    box-shadow: none !important;
  }

  .q-page-container { padding: 0 !important; }
}
</style>
