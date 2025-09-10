<template>
  <q-page class="q-pa-md page-stack">
    <!-- FILTROS -->
    <q-card class="q-pa-md q-mb-md">
      <q-form @submit.prevent="buscar">
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-3">
            <q-input v-model="filtro.de" type="date" label="De" dense outlined />
          </div>
          <div class="col-12 col-sm-3">
            <q-input v-model="filtro.ate" type="date" label="Até" dense outlined />
          </div>

          <div class="col-12 col-sm-6">
            <q-btn :loading="loading" color="primary" icon="search" label="Buscar" type="submit" no-caps />
            <q-btn flat color="grey-8" icon="clear" class="q-ml-sm" label="Limpar" no-caps @click="limpar"/>
          </div>
        </div>
      </q-form>
    </q-card>

    <!-- RESULTADOS -->
    <q-card class="q-pa-md">
      <div class="row items-center q-mb-sm">
        <div class="text-h6">Disponibilidade de Veículos</div>
        <q-space />
        <div class="text-caption text-grey-7" v-if="periodoLabel">
          Período: {{ periodoLabel }}
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <div v-if="loading" class="q-pa-lg flex flex-center">
        <q-spinner size="lg" color="primary" />
      </div>

      <div v-else>
        <q-table
          :rows="rowsLista"
          :columns="columns"
          row-key="rowKey"
          :pagination="{rowsPerPage: 10}"
          flat
          bordered
          separator="horizontal"
          no-data-label="Sem disponibilidade no período"
        >
          <template #body-cell-janela="props">
            <q-td :props="props">
              <div class="row q-col-gutter-xs">
                <q-chip
                  v-for="slot in props.row.janelas"
                  :key="slot.key"
                  outline
                  color="primary"
                  text-color="primary"
                  class="q-mr-xs q-mb-xs"
                >
                  {{ formatHora(slot.inicio) }}–{{ formatHora(slot.fim) }}
                </q-chip>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { Agendamento } from 'src/services/AgendamentoService.js'

const $q = useQuasar()
const loading = ref(false)

const filtro = ref({ de: '', ate: '' })
const items = ref([])

const periodoLabel = computed(() => {
  if (!filtro.value.de || !filtro.value.ate) return ''
  return `${formatDiaCurto(filtro.value.de)} a ${formatDiaCurto(filtro.value.ate)}`
})

onMounted(() => {
  // período padrão: semana atual (seg a dom)
  const hoje = new Date()
  const start = new Date(hoje); start.setDate(hoje.getDate() - (hoje.getDay() === 0 ? 6 : hoje.getDay() - 1))
  const end   = new Date(start); end.setDate(start.getDate() + 6)
  filtro.value.de = toDateInput(start)
  filtro.value.ate = toDateInput(end)
  buscar()
})

async function buscar () {
  try {
    loading.value = true
    const data = await Agendamento.getDisponibilidades({
      de: filtro.value.de,
      ate: filtro.value.ate
    })
    items.value = Array.isArray(data.items) ? data.items : []
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: err?.message || 'Erro ao buscar disponibilidade' })
    items.value = []
  } finally {
    loading.value = false
  }
}

function limpar () {
  items.value = []
}

function toDateInput (d) {
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}
function formatHora (iso) {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2,'0')
  const mm = String(d.getMinutes()).padStart(2,'0')
  return `${hh}:${mm}`
}
function formatDiaCurto (yyyy_mm_dd) {
  const d = new Date(yyyy_mm_dd + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' })
}
function formatDiaLongo (yyyy_mm_dd) {
  const d = new Date(yyyy_mm_dd + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'2-digit' })
}
function dateKey (iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const mapa = computed(() => {
  const m = {}
  for (const it of items.value) {
    const key = it.vei_id
    const dkey = dateKey(it.inicio)
    if (!m[key]) {
      m[key] = {
        meta: {
          label: `${it.vei_placa} — ${it.vei_modelo} — ${it.vei_marca}`,
          sub: it.vei_marca || ''
        },
        dias: {}
      }
    }
    if (!m[key].dias[dkey]) m[key].dias[dkey] = []
    m[key].dias[dkey].push({
      key: `${key}-${it.inicio}-${it.fim}`,
      vei_id: key,
      inicio: it.inicio,
      fim: it.fim
    })
  }
  for (const vid of Object.keys(m)) {
    for (const dkey of Object.keys(m[vid].dias)) {
      const arr = m[vid].dias[dkey].sort((a,b) => new Date(a.inicio) - new Date(b.inicio))
      m[vid].dias[dkey] = mergeAdjacentes(arr)
    }
  }
  return m
})

function mergeAdjacentes (arr) {
  if (arr.length <= 1) return arr
  const out = []
  let cur = { ...arr[0] }
  for (let i=1;i<arr.length;i++) {
    const s = arr[i]
    if (new Date(cur.fim).getTime() === new Date(s.inicio).getTime()) {
      cur.fim = s.fim
    } else {
      out.push(cur)
      cur = { ...s }
    }
  }
  out.push(cur)
  return out.map(s => ({ ...s, key: `${s.vei_id}-${s.inicio}-${s.fim}` }))
}

const columns = [
  { name:'veiculo', label:'Veículo', field: row => row.veiculo, align:'left' },
  { name:'dia',     label:'Dia',     field: row => row.dia, align:'left' },
  { name:'janela',  label:'Janelas', field: 'janelas', align:'left' }
]

const rowsLista = computed(() => {
  const rows = []
  for (const vid of Object.keys(mapa.value)) {
    const meta = mapa.value[vid].meta
    for (const dkey of Object.keys(mapa.value[vid].dias).sort()) {
      const janelas = mapa.value[vid].dias[dkey]
      rows.push({
        rowKey: `${vid}-${dkey}`,
        veiculo: meta.label,
        dia: formatDiaLongo(dkey),
        janelas
      })
    }
  }
  return rows
})
</script>
