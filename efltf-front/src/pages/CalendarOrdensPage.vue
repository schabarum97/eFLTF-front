<template>
  <q-page class="q-pa-md column gap-md page-calendar">
    <div class="row items-center q-col-gutter-md header-controls">
      <div class="text-h6">Agenda de Ordens de Serviço</div>
      <q-space />

      <q-btn dense flat icon="chevron_left" @click="goPrev" />
      <div class="text-subtitle2" style="min-width: 220px; text-align:center">
        {{ monthLabel }}
      </div>
      <q-btn dense flat icon="chevron_right" @click="goNext" />
      <q-btn-toggle
        v-model="mode"
        :options="toggleOptions"
        dense
        no-caps
        unelevated
        toggle-color="primary"
      />

      <q-input
        v-model="filters.q"
        dense
        outlined
        clearable
        debounce="400"
        placeholder="Buscar (cliente, título, id...)"
        style="min-width: 260px"
        @update:model-value="reload"
      >
        <template #append><q-icon name="search" /></template>
      </q-input>

      <q-btn dense flat icon="refresh" :loading="loading" @click="reload" />
    </div>

    <!-- LEGENDA + FILTRO POR STATUS -->
    <div v-if="legend.length" class="row items-center q-col-gutter-sm">
      <div class="text-caption text-grey-7 q-mr-sm">Legenda / Filtro:</div>

      <q-chip
        v-for="s in legend"
        :key="'chip-'+s.id"
        clickable
        dense
        :outline="!isStatusActive(s.id)"
        :style="isStatusActive(s.id)
            ? { backgroundColor: s.color || '#90a4ae', color: '#fff' }
            : { borderColor: s.color || '#90a4ae', color: s.color || '#546e7a' }
        "
        :ripple="false"
        @click="toggleStatus(s.id)"
      >
        {{ s.nome }}
      </q-chip>

      <q-btn
        flat dense no-caps
        class="q-ml-xs"
        color="primary"
        label="Limpar filtro"
        v-if="activeStatusIds.length"
        @click="activeStatusIds = []"
      />
    </div>

    <!-- CALENDÁRIO -->
    <div class="calendar card q-pa-sm">
      <!-- Cabeçalho dias da semana -->
      <div class="calendar-grid calendar-header">
        <div v-for="d in weekDayLabels" :key="'h-'+d" class="cell head">
          {{ d }}
        </div>
      </div>

      <div class="calendar-grid calendar-body" :class="{'one-row': view==='week', 'one-col': view==='day'}">
        <div
          v-for="day in daysToRender"
          :key="day.iso"
          class="cell day"
          :class="{
            'is-outside': !day.inCurrentMonth && view==='month',
            'is-today': day.iso === todayISO,
            'is-selected': day.iso === selectedDate
          }"
          @click.self="selectDay(day.iso)"
        >
          <div class="day-tag row items-center justify-between">
            <span class="num">{{ day.day }}</span>
            <q-btn
              v-if="day.inCurrentMonth || view!=='month'"
              dense flat round size="sm" icon="add"
              @click.stop="newOrder(day.iso)"
            />
          </div>

          <!-- eventos -->
          <div class="events">
            <template v-for="ev in visibleEvents(day).slice(0, maxVisible)" :key="ev.id + '-' + ev._key">
              <q-badge
                class="ev"
                :style="{ backgroundColor: ev.color, borderColor: ev.color }"
                @click.stop="openOrder(ev.id)"
              >
                <div class="ev-title ellipsis">{{ ev.title }}</div>
                <div class="ev-time text-caption">{{ ev.timeLabel }}</div>
              </q-badge>
            </template>

            <div
              v-if="visibleEvents(day).length > maxVisible"
              class="more-link text-caption text-primary cursor-pointer"
              @click.stop="showDay(day)"
            >
              +{{ visibleEvents(day).length - maxVisible }} mais
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="q-mt-sm text-grey-7 text-caption">
      Carregando ordens do período visível...
    </div>

    <!-- Dialog: todos os eventos do dia -->
    <q-dialog v-model="dialogOpen" maximized persistent>
      <q-card class="q-pa-md">
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle1">
            Eventos de {{ dialogDayLabel }}
          </div>
          <q-space/>
          <q-btn flat round dense icon="close" v-close-popup />
        </div>

        <q-separator class="q-mb-md"/>

        <div v-if="dialogDay?.events?.length">
          <div
            v-for="ev in visibleEvents(dialogDay)"
            :key="'dlg-'+ev.id+'-'+ev._key"
            class="q-mb-sm"
          >
            <q-badge
              class="ev ev-wide"
              :style="{ backgroundColor: ev.color, borderColor: ev.color }"
              @click="openOrder(ev.id)"
            >
              <div class="ev-title">{{ ev.title }}</div>
              <div class="ev-time text-caption">{{ ev.timeLabel }}</div>
            </q-badge>
          </div>
        </div>

        <div v-else class="text-grey-7">Sem eventos neste dia.</div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Ordem as OrdemService } from 'src/services/OrdemService.js'

const maxVisible = 3

const router = useRouter()
const loading = ref(false)
const filters = ref({ q: '' })

// visão: month | week | day
const view = ref('month')

const MODE_TODAY = '__today__'
const mode = ref(view.value)
const toggleOptions = [
  { label: 'Hoje', value: MODE_TODAY },
  { label: 'Mês', value: 'month' },
  { label: 'Semana', value: 'week' },
  { label: 'Dia', value: 'day' }
]

// mês visível (primeiro dia do mês)
const currentMonth = ref(startOfMonth(new Date()))
const todayISO = toISO(new Date()).slice(0, 10)
const selectedDate = ref(todayISO)

// label do mês (Intl)
const fmtMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
const monthLabel = computed(() => {
  const s = fmtMonth.format(currentMonth.value)
  return s.charAt(0).toUpperCase() + s.slice(1)
})

const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// grid e legenda
const days = ref([])
const legend = ref([])

// filtro de status
const activeStatusIds = ref([])
const isStatusActive = id => activeStatusIds.value.length === 0 || activeStatusIds.value.includes(id)
function toggleStatus (id) {
  const i = activeStatusIds.value.indexOf(id)
  if (i >= 0) activeStatusIds.value.splice(i, 1)
  else activeStatusIds.value.push(id)
}

// popup
const dialogOpen = ref(false)
const dialogDay = ref(null)
const dialogDayLabel = ref('')

// render conforme visão
const daysToRender = computed(() => {
  if (view.value === 'month') return days.value
  if (view.value === 'week') {
    const s = weekStart(new Date(selectedDate.value))
    const sISO = toISO(s).slice(0,10)
    const eISO = toISO(addDays(s, 7)).slice(0,10)
    return days.value.filter(d => d.iso >= sISO && d.iso < eISO)
  }
  return days.value.filter(d => d.iso === selectedDate.value)
})

watch(mode, (val) => {
  if (val === MODE_TODAY) {
    goToday()
    mode.value = view.value
  } else if (val !== view.value) {
    view.value = val
    reload()
  }
})
watch(view, (v) => { if (mode.value !== MODE_TODAY && mode.value !== v) mode.value = v })

watch(currentMonth, () => buildCalendarDays(), { immediate: true })
function buildCalendarDays () {
  const start = calendarGridStart(currentMonth.value)
  const arr = []
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i)
    arr.push({
      iso: toISO(d).slice(0, 10),
      day: d.getDate(),
      inCurrentMonth: d.getMonth() === currentMonth.value.getMonth(),
      events: []
    })
  }
  days.value = arr
}

function goPrev () {
  if (view.value === 'month') {
    currentMonth.value = addMonths(currentMonth.value, -1)
  } else {
    selectedDate.value = addDays(new Date(selectedDate.value), view.value === 'week' ? -7 : -1).toISOString().slice(0,10)
    currentMonth.value = startOfMonth(new Date(selectedDate.value))
  }
  reload()
}
function goNext () {
  if (view.value === 'month') {
    currentMonth.value = addMonths(currentMonth.value, 1)
  } else {
    selectedDate.value = addDays(new Date(selectedDate.value), view.value === 'week' ? 7 : 1).toISOString().slice(0,10)
    currentMonth.value = startOfMonth(new Date(selectedDate.value))
  }
  reload()
}
function goToday () {
  const today = new Date()
  currentMonth.value = startOfMonth(today)
  selectedDate.value = toISO(today).slice(0,10)
  reload()
}
function selectDay (iso) {
  selectedDate.value = iso
  if (view.value !== 'month') currentMonth.value = startOfMonth(new Date(iso))
}

function showDay(day) {
  if (!day) return
  dialogDay.value = day
  const [y, m, d] = day.iso.split('-').map(Number)
  dialogDayLabel.value = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).format(new Date(y, m - 1, d))
  dialogOpen.value = true
}

async function reload () {
  loading.value = true
  try {
    let start, end
    if (view.value === 'month') {
      start = calendarGridStart(currentMonth.value)
      end = addDays(start, 42)
    } else if (view.value === 'week') {
      start = weekStart(new Date(selectedDate.value))
      end = addDays(start, 7)
    } else {
      const d = new Date(selectedDate.value)
      start = d
      end = addDays(d, 1)
    }

    const params = {
      start: toISO(start),
      end: toISO(end),
      q: filters.value.q || undefined
    }
    const { items = [] } = await OrdemService.getAll(params)

    for (const d of days.value) d.events = []
    const legendMap = new Map()

    for (const o of items) {
      const dayISO = (o.data || '').slice(0, 10)
      if (!dayISO) continue

      const slot = days.value.find(d => d.iso === dayISO)
      if (!slot) continue

      const rawHora = (o.hora || '').trim()
      const timeLabel = rawHora && rawHora !== '00:00:00' ? rawHora.slice(0,5) : ''

      const color = o.status_cor || '#90a4ae'
      if (!legendMap.has(o.stt_id)) {
        legendMap.set(o.stt_id, { id: o.stt_id, nome: o.status_nome || `Status ${o.stt_id}`, color })
      }

      slot.events.push({
        id: String(o.id),
        title: buildTitle(o),
        timeLabel,
        color,
        stt_id: o.stt_id,
        _key: dayISO + '-' + o.id
      })
    }

    legend.value = Array.from(legendMap.values())
      .sort((a, b) => String(a.nome).localeCompare(String(b.nome)))

    for (const d of days.value) {
      d.events.sort((a, b) => (a.timeLabel || '').localeCompare(b.timeLabel || ''))
    }
  } finally {
    loading.value = false
  }
}

onMounted(reload)

function visibleEvents (day) {
  if (!activeStatusIds.value.length) return day.events
  return day.events.filter(ev => activeStatusIds.value.includes(ev.stt_id))
}
function buildTitle (o) {
  const id = o.id ? `#${o.id}` : ''
  const cli = o.cliente_nome ? ` — ${o.cliente_nome}` : ''
  const obs = o.observacao ? ` — ${o.observacao}` : ''
  return [id, cli, obs].filter(Boolean).join(' ')
}
function openOrder (id) {
  router.push({ name: 'ordemfull', query: { ord_id: String(id) } })
}
function newOrder (isoDay) {
  router.push({ name: 'ordemfull', query: { data: isoDay } })
}

function startOfMonth (d) {
  const x = new Date(d)
  x.setDate(1); x.setHours(0,0,0,0)
  return x
}
function addDays (d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
function addMonths (d, n) {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return startOfMonth(x)
}
function toISO (d) {
  const pad = v => String(v).padStart(2, '0')
  const x = new Date(d)
  const y = x.getFullYear()
  const m = pad(x.getMonth()+1)
  const dd = pad(x.getDate())
  const hh = pad(x.getHours())
  const mi = pad(x.getMinutes())
  const ss = pad(x.getSeconds())
  return `${y}-${m}-${dd}T${hh}:${mi}:${ss}`
}
function calendarGridStart (monthDate) {
  const first = startOfMonth(monthDate)
  const dayOfWeek = first.getDay()
  return addDays(first, -dayOfWeek)
}
function weekStart (d) {
  const tmp = new Date(d)
  const dow = tmp.getDay()
  return addDays(tmp, -dow) // domingo
}
</script>

<style scoped>
.page-calendar .calendar.card {
  border-radius: 12px;
  background: white;
  box-shadow: var(--q-shadow-1);
}

/* grid 7 colunas */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

/* cabeçalho */
.calendar-header .cell.head {
  padding: 8px;
  font-weight: 600;
  text-align: center;
  color: #616161;
  border-bottom: 1px solid #e0e0e0;
}

/* corpo */
.calendar-body.one-row { grid-template-rows: 1fr; }
.calendar-body.one-col { grid-template-columns: repeat(1, minmax(0, 1fr)); }

.calendar-body .cell.day {
  min-height: 120px;
  border-right: 1px solid #eeeeee;
  border-bottom: 1px solid #eeeeee;
  padding: 6px;
  position: relative;
  background: #fff;
  min-width: 0;
  cursor: default;
}
.calendar-body .cell.day:nth-child(7n) { border-right: none; }

.cell.day.is-outside { background: #fafafa; color: #9e9e9e; }
.cell.day.is-today  { box-shadow: inset 0 0 0 2px #42a5f5; border-radius: 8px; }
.cell.day.is-selected {
  box-shadow: none;
  background: #f4faf5;
  border-radius: 8px;
}

.day-tag { margin-bottom: 4px; }
.day-tag .num { font-weight: 600; font-size: 14px; }

/* eventos */
.events { display: flex; flex-direction: column; gap: 4px; min-width: 0; }

.ev {
  width: 100%;
  border: 1px solid transparent;
  color: #fff;
  padding: 3px 6px;
  border-radius: 6px;
  cursor: pointer;
  line-height: 1.1;
  display: block;
  min-width: 0;
}
.ev.ev-wide { padding: 6px 8px; }
.ev-title { font-size: 12px; font-weight: 600; min-width: 0; }
.ev-time  { font-size: 10px; opacity: 0.9; }

.ellipsis { display: inline-block; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.more-link { margin-top: 2px; }

@media (min-width: 1200px) {
  .calendar-body .cell.day { min-height: 150px; }
}

/* Header alinhado */
.header-controls {
  align-items: center;
  gap: 8px;
  --ctl-h: 34px;
}

:deep(.header-controls .q-btn),
:deep(.header-controls .q-btn-toggle),
:deep(.header-controls .q-btn-toggle .q-btn){
  height: var(--ctl-h) !important;
  min-height: var(--ctl-h) !important;
}
:deep(.header-controls .q-btn .q-btn__content){
  height: 100%;
  align-items: center;
  line-height: 1;
}
:deep(.header-controls .q-field--dense .q-field__control){
  height: var(--ctl-h) !important;
  min-height: var(--ctl-h) !important;
}
</style>
