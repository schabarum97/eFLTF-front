<template>
  <q-page class="q-pa-md page-dash">

    <!-- HEADER -->
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="text-h6">Dashboard — Ordens de Serviço</div>
      <q-space />
      <q-btn dense outline icon="refresh" label="Atualizar" @click="loadAll" />
    </div>

    <!-- KPIs -->
    <div class="kpi-grid q-mb-md">
      <q-card class="kpi-card">
        <q-card-section class="q-pa-sm">
          <div class="row items-center">
            <q-icon name="pending_actions" size="28px" class="q-mr-sm text-warning" />
            <div class="text-subtitle2 text-grey-7">Aguard. aprovação</div>
          </div>
          <div class="kpi-value">
            <q-skeleton v-if="loading.resumo" type="text" width="60px" />
            <span v-else>{{ resumo.agr_aprovacao ?? 0 }}</span>
          </div>
        </q-card-section>
      </q-card>
      <q-card class="kpi-card">
        <q-card-section class="q-pa-sm">
          <div class="row items-center">
            <q-icon name="assignment" size="28px" class="q-mr-sm text-primary" />
            <div class="text-subtitle2 text-grey-7">Abertas</div>
          </div>
          <div class="kpi-value">
            <q-skeleton v-if="loading.resumo" type="text" width="60px" />
            <span v-else>{{ resumo.abertas ?? 0 }}</span>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="kpi-card">
        <q-card-section class="q-pa-sm">
          <div class="row items-center">
            <q-icon name="schedule" size="28px" class="q-mr-sm text-negative" />
            <div class="text-subtitle2 text-grey-7">Atrasadas</div>
          </div>
          <div class="kpi-value">
            <q-skeleton v-if="loading.resumo" type="text" width="60px" />
            <span v-else>{{ resumo.atrasadas ?? 0 }}</span>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="kpi-card">
        <q-card-section class="q-pa-sm">
          <div class="row items-center">
            <q-icon name="today" size="28px" class="q-mr-sm text-warning" />
            <div class="text-subtitle2 text-grey-7">Vencem Hoje</div>
          </div>
          <div class="kpi-value">
            <q-skeleton v-if="loading.resumo" type="text" width="60px" />
            <span v-else>{{ resumo.vencem_hoje ?? 0 }}</span>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="kpi-card">
        <q-card-section class="q-pa-sm">
          <div class="row items-center">
            <q-icon name="check_circle" size="28px" class="q-mr-sm text-positive" />
            <div class="text-subtitle2 text-grey-7">Concluídas (mês)</div>
          </div>
          <div class="kpi-value">
            <q-skeleton v-if="loading.resumo" type="text" width="60px" />
            <span v-else>{{ resumo.concluidas_mes ?? 0 }}</span>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="kpi-card">
        <q-card-section class="q-pa-sm">
          <div class="row items-center">
            <q-icon name="payments" size="28px" class="q-mr-sm text-primary" />
            <div class="text-subtitle2 text-grey-7">Faturamento (mês)</div>
          </div>
          <div class="kpi-value">
            <q-skeleton v-if="loading.resumo" type="text" width="100px" />
            <span v-else>{{ formatCurrency(resumo.faturamento_mes) }}</span>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="kpi-card">
        <q-card-section class="q-pa-sm">
          <div class="row items-center">
            <q-icon name="sell" size="28px" class="q-mr-sm text-primary" />
            <div class="text-subtitle2 text-grey-7">Ticket médio (mês)</div>
          </div>
          <div class="kpi-value">
            <q-skeleton v-if="loading.resumo" type="text" width="100px" />
            <span v-else>{{ formatCurrency(resumo.ticket_medio_mes) }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- LINHA 2: Por Responsável | Backlog por Idade -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div class="text-subtitle1">OS por responsável</div>
              <q-space />
              <q-btn flat dense round icon="refresh" @click="loadPorResponsavel" />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div v-if="loading.resp">
              <q-skeleton v-for="n in 5" :key="n" type="text" class="q-mb-sm" />
            </div>
            <div v-else>
              <div
                v-for="(r, idx) in porResponsavel.items"
                :key="idx"
                class="bar-row q-mb-sm"
              >
                <div class="row items-center q-mb-xs">
                  <div class="col text-body2 ellipsis">{{ r.responsavel }}</div>
                  <div class="col-auto text-caption text-grey-7">{{ r.total }}</div>
                </div>
                <q-linear-progress
                  :value="maxResp > 0 ? r.total / maxResp : 0"
                  rounded
                  stripe
                />
              </div>
              <div v-if="!porResponsavel.items?.length" class="text-grey-6">
                Sem dados para exibir.
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div class="text-subtitle1">Backlog por idade</div>
              <q-space />
              <q-btn flat dense round icon="refresh" @click="loadAging" />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div v-if="loading.aging">
              <q-skeleton v-for="n in 4" :key="n" type="text" class="q-mb-sm" />
            </div>
            <div v-else>
              <div
                v-for="(b, idx) in backlogAging.items"
                :key="idx"
                class="bar-row q-mb-sm"
              >
                <div class="row items-center q-mb-xs">
                  <div class="col text-body2">{{ b.faixa }}</div>
                  <div class="col-auto text-caption text-grey-7">{{ b.total }}</div>
                </div>
                <q-linear-progress
                  :value="maxAging > 0 ? b.total / maxAging : 0"
                  rounded
                  color="secondary"
                />
              </div>
              <div v-if="!backlogAging.items?.length" class="text-grey-6">
                Sem dados para exibir.
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- LINHA 3: Hoje + Amanhã | Pagamentos Recentes -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-7">
        <q-card>
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div class="text-subtitle1">OS de hoje e amanhã</div>
              <q-space />
              <q-btn flat dense round icon="refresh" @click="loadHojeEAmanha" />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-table
              :rows="hojeAmanha.items"
              :columns="colsHoje"
              row-key="ord_id"
              dense
              flat
              :loading="loading.hoje"
              no-data-label="Sem OS para hoje/amanhã"
            >
              <template #body-cell-acao="props">
                <q-td :props="props">
                  <q-btn
                    dense flat round icon="open_in_new"
                    @click="abrirOS(props.row)"
                    :title="`Abrir OS #${props.row.ord_id}`"
                  />
                </q-td>
              </template>
              <template #loading>
                <q-inner-loading showing color="primary" />
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card>
          <q-card-section class="q-pb-none">
            <div class="row items-center">
              <div class="text-subtitle1">Pagamentos vencidos (por dia)</div>
              <q-space />
              <q-btn flat dense round icon="refresh" @click="loadPagamentos" />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div v-if="loading.pags">
              <q-skeleton v-for="n in 6" :key="n" type="rect" class="q-mb-sm" height="26px" />
            </div>

            <q-list v-else dense bordered class="rounded-borders">
              <q-item v-for="(d, idx) in pagamentos.items" :key="idx">
                <q-item-section avatar>
                  <q-icon name="warning" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-body2">
                    {{ formatDate(d.dia) }} — {{ formatCurrency(d.valor_total) }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ Number(d.qtd_parcelas) }} parcela(s) vencida(s)
                  </q-item-label>
                </q-item-section>
              </q-item>

              <div v-if="!pagamentos.items?.length" class="q-pa-sm text-grey-6">
                Sem parcelas vencidas.
              </div>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- LINHA 4: Heatmap -->
    <q-card>
      <q-card-section class="q-pb-none">
        <div class="row items-center">
          <div class="text-subtitle1">Carga por dia / hora</div>
          <q-space />
          <q-btn flat dense round icon="refresh" @click="loadCarga" />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div v-if="loading.carga">
          <q-skeleton type="rect" height="180px" />
        </div>
        <div v-else class="heatmap">
          <div class="heatmap-legend">
            <div class="text-caption text-grey-7">0=Dom • 1=Seg • ... • 6=Sáb</div>
          </div>
          <div class="heatmap-grid">
            <div
              v-for="cell in heatmapCells"
              :key="cell.key"
              class="heat-cell"
              :style="cellStyle(cell.value, heatMax)"
              :title="`DOW ${cell.dow} • ${cell.hora}h = ${cell.value}`"
            ></div>
          </div>
        </div>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Dash } from 'src/services/DashService'

const router = useRouter()

// STATE
const resumo = ref({})
const porResponsavel = ref({ total: 0, items: [] })
const backlogAging = ref({ total: 0, items: [] })
const hojeAmanha = ref({ total: 0, items: [] })
const pagamentos = ref({ total: 0, items: [] })
const carga = ref({ total: 0, items: [] })

const loading = ref({
  resumo: false,
  resp: false,
  aging: false,
  hoje: false,
  pags: false,
  carga: false
})

// COLUNAS TABELA HOJE/AMANHÃ
const colsHoje = [
  { name: 'ord_id', label: '#', field: 'ord_id', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
  { name: 'endereco', label: 'Endereço', field: 'endereco', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  {
    name: 'data',
    label: 'Data',
    field: row => formatDate(row.ord_data),
    align: 'left',
    sortable: true
  },
  { name: 'hora', label: 'Hora', field: 'ord_hora', align: 'left' },
  { name: 'acao', label: 'Ações', field: 'acao', align: 'right' }
]

// LOADERS
async function loadResumo () {
  loading.value.resumo = true
  try {
    resumo.value = await Dash.getResumo()
  } finally {
    loading.value.resumo = false
  }
}
async function loadPorResponsavel () {
  loading.value.resp = true
  try {
    porResponsavel.value = await Dash.getPorResponsavel()
  } finally {
    loading.value.resp = false
  }
}
async function loadAging () {
  loading.value.aging = true
  try {
    backlogAging.value = await Dash.getBacklogAging()
  } finally {
    loading.value.aging = false
  }
}
async function loadHojeEAmanha () {
  loading.value.hoje = true
  try {
    hojeAmanha.value = await Dash.getHojeEAmanha()
  } finally {
    loading.value.hoje = false
  }
}
async function loadPagamentos () {
  loading.value.pags = true
  try {
    pagamentos.value = await Dash.getPagamentosRecentes()
  } finally {
    loading.value.pags = false
  }
}
async function loadCarga () {
  loading.value.carga = true
  try {
    carga.value = await Dash.getCargaDiaHora()
  } finally {
    loading.value.carga = false
  }
}

async function loadAll () {
  await Promise.all([
    loadResumo(),
    loadPorResponsavel(),
    loadAging(),
    loadHojeEAmanha(),
    loadPagamentos(),
    loadCarga()
  ])
}

onMounted(loadAll)

// DERIVADOS
const maxResp = computed(() => Math.max(0, ...porResponsavel.value.items.map(i => Number(i.total) || 0)))
const maxAging = computed(() => Math.max(0, ...backlogAging.value.items.map(i => Number(i.total) || 0)))

// Heatmap 7x24
const heatMax = computed(() => Math.max(0, ...carga.value.items.map(i => Number(i.total) || 0)))
const heatmapCells = computed(() => {
  const map = new Map()
  for (const it of (carga.value.items || [])) {
    const key = `${it.dow}-${it.hora}`
    map.set(key, { dow: Number(it.dow), hora: Number(it.hora), value: Number(it.total) })
  }
  const cells = []
  for (let dow = 0; dow <= 6; dow++) {
    for (let hora = 0; hora <= 23; hora++) {
      const key = `${dow}-${hora}`
      const it = map.get(key)
      cells.push({ key, dow, hora, value: it ? it.value : 0 })
    }
  }
  return cells
})

function abrirOS (row) {
  router.push({ name: 'ordemfull', query: { ord_id: row.ord_id } })
}

function formatCurrency (v) {
  const num = Number(v || 0)
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate (isoOrDate) {
  if (!isoOrDate) return '—'
  const d = new Date(isoOrDate)
  return d.toLocaleDateString('pt-BR')
}
function formatDateTime (isoOrDate) {
  if (!isoOrDate) return '—'
  const d = new Date(isoOrDate)
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
function cellStyle (value, max) {
  const ratio = max > 0 ? value / max : 0
  // escala 0..1 → opacidade 0.08..0.95
  const alpha = ratio === 0 ? 0.06 : (0.1 + ratio * 0.85)
  return {
    background: `rgba(25, 118, 210, ${alpha})` // azul do primary (aprox)
  }
}
</script>

<style scoped>
.page-dash {
  display: flex;
  flex-direction: column;
}

/* KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.kpi-card {
  border-radius: 14px;
}
.kpi-value {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 700;
}

/* Barras */
.bar-row .q-linear-progress {
  height: 8px;
}

/* Heatmap */
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 4px;
}
.heat-cell {
  width: 100%;
  padding-top: 100%; /* quadrado */
  border-radius: 4px;
}

/* Responsividade */
@media (max-width: 1400px) {
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 700px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
