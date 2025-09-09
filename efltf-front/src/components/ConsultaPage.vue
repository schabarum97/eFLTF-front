<template>
  <q-page class="q-pa-md page-stack">
    <!-- FILTROS -->
    <q-card class="q-pa-md filters-card">
      <q-card-section class="q-pa-none q-mb-sm">
        <div class="text-h6">{{ title || 'Consulta' }}</div>
        <div class="text-caption text-grey-7">Defina os filtros e aplique para ver os resultados</div>
      </q-card-section>

      <q-form ref="filterForm" @submit.prevent="applyFilters">
        <!-- GRID DE FILTROS-->
        <div class="filters-grid">
          <div v-for="field in filterFields" :key="field.model" class="field">
            <!-- TEXT / NUMBER -->
            <q-input
              v-if="isTextLike(field)"
              v-model="filters[field.model]"
              :label="withRequiredAsterisk(field)"
              :type="field.type === 'number' ? 'number' : (field.type || 'text')"
              :maxlength="field.maxlength"
              dense outlined clearable
              :debounce="350"
              @update:model-value="autoSearch && debouncedFilter()"
            />

            <!-- SWITCH -->
            <q-toggle
              v-else-if="field.type === 'switch'"
              v-model="filters[field.model]"
              :label="field.label"
              dense
              @update:model-value="autoSearch && applyFilters()"
            />

            <!-- CHECKBOX -->
            <q-checkbox
              v-else-if="field.type === 'checkbox'"
              v-model="filters[field.model]"
              :label="field.label"
              dense
              @update:model-value="autoSearch && applyFilters()"
            />

            <!-- SELECT -->
            <q-select
              v-else-if="field.type === 'select'"
              v-model="filters[field.model]"
              :label="withRequiredAsterisk(field)"
              :options="normalizeOptions(field.options, field)"
              :option-label="field.optionLabel || 'label'"
              :option-value="field.optionValue || 'value'"
              emit-value map-options dense outlined clearable
              :rules="getRules(field)"
              @update:model-value="autoSearch && applyFilters()"
            />

            <!-- MULTISELECT -->
            <q-select
              v-else-if="field.type === 'multiselect'"
              v-model="filters[field.model]"
              :label="withRequiredAsterisk(field)"
              :options="normalizeOptions(field.options, field)"
              :option-label="field.optionLabel || 'label'"
              :option-value="field.optionValue || 'value'"
              multiple emit-value map-options dense outlined clearable
              :rules="getRules(field)"
              @update:model-value="autoSearch && applyFilters()"
            />

            <!-- LOOKUP -->
            <q-select
              v-else-if="field.type === 'lookup'"
              v-model="filters[field.model]"
              :label="withRequiredAsterisk(field)"
              use-input input-debounce="300"
              :options="lookupCache[field.model] || []"
              :option-label="field.optionLabel || 'label'"
              :option-value="field.optionValue || 'value'"
              emit-value map-options dense outlined clearable
              :loading="lookupLoading[field.model]"
              @filter="(val, update, abort) => filterLookup(field, val, update, abort)"
              :rules="getRules(field)"
              @update:model-value="autoSearch && applyFilters()"
            >
              <template #prepend><q-icon name="search" /></template>
              <template #no-option>
                <q-item><q-item-section class="text-grey">Sem resultados</q-item-section></q-item>
              </template>
            </q-select>

            <!-- DATE -->
            <q-input
              v-else-if="field.type === 'date'"
              :model-value="formatDateForDisplay(filters[field.model], field)"
              @update:model-value="onDateInput(field, $event)"
              :label="withRequiredAsterisk(field)"
              dense outlined readonly clearable
              :rules="getRules(field)"
            >
              <template #prepend><q-icon name="event" /></template>
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="filters[field.model]"
                  @update:model-value="onDatePick(field, $event)"
                  :mask="field.format || 'YYYY-MM-DD'"
                  today-btn
                />
              </q-popup-proxy>
            </q-input>

            <!-- DATERANGE -->
            <q-input
              v-else-if="field.type === 'daterange'"
              :model-value="formatDateRangeForDisplay(filters[field.model], field)"
              :label="withRequiredAsterisk(field)"
              dense outlined readonly clearable
              :rules="getRules(field)"
            >
              <template #prepend><q-icon name="event" /></template>
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date
                  range
                  :model-value="filters[field.model]"
                  @update:model-value="onDateRangePick(field, $event)"
                  :mask="field.format || 'YYYY-MM-DD'"
                  today-btn
                />
              </q-popup-proxy>
            </q-input>

            <!-- CURRENCY -->
            <q-input
              v-else-if="field.type === 'currency'"
              :model-value="currencyDisplay(field, filters[field.model])"
              @update:model-value="val => onCurrencyInput(field, val, 'single')"
              :label="withRequiredAsterisk(field)"
              dense outlined inputmode="decimal" clearable prefix="R$"
              :rules="getRules(field)"
            >
              <template #append><q-icon name="payments" /></template>
            </q-input>

            <!-- CURRENCY RANGE -->
            <div v-else-if="field.type === 'currencyrange'" class="row q-col-gutter-xs">
              <div class="col">
                <q-input
                  :model-value="currencyDisplay(field, (filters[field.model]||{}).min)"
                  @update:model-value="val => onCurrencyInput(field, val, 'min')"
                  :label="(field.label || 'Valor') + ' (mín.)'"
                  dense outlined inputmode="decimal" clearable prefix="R$"
                />
              </div>
              <div class="col">
                <q-input
                  :model-value="currencyDisplay(field, (filters[field.model]||{}).max)"
                  @update:model-value="val => onCurrencyInput(field, val, 'max')"
                  :label="(field.label || 'Valor') + ' (máx.)'"
                  dense outlined inputmode="decimal" clearable prefix="R$"
                />
              </div>
            </div>

            <!-- NUMBER RANGE -->
            <div v-else-if="field.type === 'numberrange'" class="row q-col-gutter-xs">
              <div class="col">
                <q-input v-model.number="ensureRange(field).min" type="number" label="Mín."
                         dense outlined clearable
                         @update:model-value="autoSearch && applyFilters()" />
              </div>
              <div class="col">
                <q-input v-model.number="ensureRange(field).max" type="number" label="Máx."
                         dense outlined clearable
                         @update:model-value="autoSearch && applyFilters()" />
              </div>
            </div>

            <!-- FALLBACK -->
            <q-input
              v-else
              v-model="filters[field.model]"
              :label="withRequiredAsterisk(field)"
              :maxlength="field.maxlength"
              dense outlined clearable
              :debounce="350"
              @update:model-value="autoSearch && debouncedFilter()"
            />
          </div>

          <!-- PESQUISA GLOBAL -->
          <div class="field field-wide">
            <q-input
              v-model="globalSearch"
              label="Pesquisar em tudo…"
              dense
              outlined
              clearable
              debounce="300"
              @update:model-value="applyFilters"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
        </div>

        <!-- AÇÕES + CHIPS -->
        <div class="row items-center justify-between q-mt-sm">
          <div class="row items-center q-gutter-sm">
            <q-btn type="submit" label="Aplicar" color="secondary" no-caps unelevated />
            <q-btn label="Limpar" color="grey-7" outline no-caps @click="clearFilters" />

            <q-separator vertical inset class="q-mx-sm gt-xs" />
            <q-btn flat dense round icon="file_download" @click="exportCsv">
              <q-tooltip>Exportar CSV</q-tooltip>
            </q-btn>
            <q-btn flat dense round icon="refresh" @click="reload">
              <q-tooltip>Recarregar</q-tooltip>
            </q-btn>
            <q-btn flat dense round :icon="dense ? 'density_small' : 'view_agenda'" @click="dense = !dense">
              <q-tooltip>{{ dense ? 'Espaçamento padrão' : 'Modo denso' }}</q-tooltip>
            </q-btn>
          </div>

          <div class="row items-center q-gutter-xs" v-if="activeFilterChips.length">
            <div class="text-caption text-grey-7 q-mr-xs">Filtros:</div>
            <q-chip
              v-for="chip in activeFilterChips"
              :key="chip.key"
              dense removable clickable
              @remove="removeChip(chip)"
            >
              {{ chip.label }}: {{ chip.valueText }}
            </q-chip>
          </div>
        </div>
      </q-form>
    </q-card>

    <!-- TABELA -->
    <q-card class="table-card">
      <div class="table-scroll">
        <q-table
          :rows="visibleRows"
          :columns="normalizedColumns"
          row-key="id"
          :rows-per-page-options="[5, 10, 15, 20, 50]"
          v-model:pagination="pagination"
          :dense="dense"
          flat separator="cell"
          table-header-class="table-header"
          :no-data-label="'Sem dados'"
          :no-results-label="'Sem resultados com os filtros aplicados'"
          :row-class="rowClassFn"
        >
          <!-- Coluna AÇÕES -->
          <template v-if="hasActions" #body-cell-acoes="scope">
            <q-td :props="scope">
              <div class="row items-center no-wrap q-gutter-xs">
                <q-btn
                  v-for="(act, idx) in rowActions"
                  :key="idx"
                  v-show="!act.show || act.show(scope.row)"
                  :icon="act.icon || 'bolt'"
                  :color="act.color || 'primary'"
                  round dense flat
                  @click="act.handler && act.handler(scope.row)"
                  :title="act.label"
                />
              </div>
            </q-td>
          </template>

          <!-- Células padrão -->
          <template #body-cell="scope">
            <q-td
              :props="scope"
              class="cell-ellipsis"
              :class="rowClassFn(scope.row)"
            >
              <template v-if="scope.col.name === 'status_nome' && scope.row.status_cor">
                <q-chip dense :style="statusChipStyle(scope.row.status_cor)" text-color="white">
                  {{ scope.value }}
                </q-chip>
              </template>
              <template v-else-if="scope.col.type === 'date'">
                <span :title="String(scope.value ?? '')">{{ toBRDate(scope.value) }}</span>
              </template>
              <template v-else>
                <span :title="String(scope.value ?? '')">{{ scope.value }}</span>
              </template>
            </q-td>
          </template>

          <template #bottom>
            <div class="row items-center justify-between full-width q-pa-sm">
              <div class="text-caption text-grey-7">
                {{ filteredCount }} de {{ itemsRaw.length }} registro(s)
              </div>
              <q-pagination
                v-model="pagination.page"
                :max="maxPages"
                max-pages="6"
                boundary-numbers
                direction-links
                dense
              />
            </div>
          </template>
        </q-table>
      </div>

      <q-inner-loading :showing="loading"><q-spinner /></q-inner-loading>
    </q-card>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'

export default {
  name: 'ConsultaPage',
  props: {
    service: { type: Object, required: true },
    filterFields: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    title: { type: String, default: '' },
    autoSearch: { type: Boolean, default: true },
    initialFilters: { type: Object, default: () => ({}) },

    rowActions: { type: Array, default: () => [] },
    rowClass:   { type: [String, Function], default: null }
  },
  data () {
    return {
      $q: useQuasar(),
      loading: false,
      itemsRaw: [],
      itemsFiltered: [],
      filteredCount: 0,
      globalSearch: '',
      pagination: { page: 1, rowsPerPage: 20, sortBy: null, descending: false },
      dense: true,
      filters: {},
      lookupCache: {},
      lookupLoading: {},
      debounceTimer: null
    }
  },
  computed: {
    hasActions () { return Array.isArray(this.rowActions) && this.rowActions.length > 0 },

    normalizedColumns () {
      const base = (this.columns || []).map(c => ({
        ...c,
        align: c.align || 'left',
        sortable: c.sortable ?? true,
        headerStyle: (c.headerStyle || '') + ';min-width:120px;',
        style: (c.style || '') + ';min-width:120px;'
      }))

      if (!this.hasActions) return base
      const already = base.some(c => c.name === 'acoes')
      if (already) return base
      return [
        { name: 'acoes', label: 'Ações', field: '__actions__', align: 'center', sortable: false, headerStyle: 'min-width:15px;', style: 'min-width:15px;' },
        ...base
      ]
    },
    maxPages () {
      const rpp = this.pagination.rowsPerPage || 10
      const total = this.filteredCount || 0
      return Math.max(1, Math.ceil(total / rpp))
    },
    visibleRows () { return this.itemsFiltered },
    activeFilterChips () {
      const chips = []
      for (const f of this.filterFields) {
        const v = this.filters[f.model]
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && !val.length)) continue
        let text = ''
        if (f.type === 'daterange' && v?.from && v?.to) text = `${this.toBRDate(v.from)} → ${this.toBRDate(v.to)}`
        else if (f.type === 'date') text = this.toBRDate(v)
        else if (f.type === 'currencyrange') {
          const min = v?.min != null ? this.fmtCurrency(v.min, f.currency || 'BRL') : ''
          const max = v?.max != null ? this.fmtCurrency(v.max, f.currency || 'BRL') : ''
          text = [min, max].filter(Boolean).join(' ~ ')
        } else if (f.type === 'numberrange') {
          const min = v?.min != null ? String(v.min) : ''
          const max = v?.max != null ? String(v.max) : ''
          text = [min, max].filter(Boolean).join(' ~ ')
        } else if (Array.isArray(v)) text = v.join(', ')
        else text = String(v)
        chips.push({ key: f.model, label: f.label, valueText: text })
      }
      return chips
    }
  },
  methods: {
    withRequiredAsterisk (field) { return field.required ? `${field.label} *` : field.label },
    isTextLike (field) { return !field.type || ['text', 'number', 'password', 'email', 'tel'].includes(field.type) },
    fmtCurrency (n, cur) { try { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur }).format(Number(n)) } catch { return String(n) } },
    normalizeStr (s) { return String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim() },
    statusChipStyle (hex) { return { backgroundColor: hex, color: '#fff' } },

    rowClassFn (row) {
      if (!this.rowClass) return ''
      return (typeof this.rowClass === 'function') ? this.rowClass(row) : this.rowClass
    },

    getRules (field) {
      const rules = []
      if (field.required) {
        rules.push(v => {
          if (['number','currency'].includes(field.type)) return (v !== null && v !== '' && !Number.isNaN(Number(v))) || 'Campo obrigatório'
          if (field.type === 'daterange') return (v && v.from && v.to) || 'Informe o intervalo'
          if (['currencyrange','numberrange'].includes(field.type)) return (v && (v.min != null || v.max != null)) || 'Informe ao menos um limite'
          const s = (v ?? '').toString().trim()
          return s.length > 0 || 'Campo obrigatório'
        })
      }
      if (field.maxlength) rules.push(v => v == null || String(v).length <= field.maxlength || `Máx. ${field.maxlength} caracteres`)
      return rules
    },

    normalizeDateYMD (val) {
      if (!val) return null
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val
      const d = new Date(val)
      if (!isNaN(d)) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      }
      return null
    },
    toBRDate (val) {
      const ymd = this.normalizeDateYMD(val)
      if (!ymd) return ''
      const [y, m, d] = ymd.split('-')
      return `${d}/${m}/${y}`
    },

    formatDateForDisplay (val) { return this.toBRDate(val) },
    onDatePick (field, value) {
      this.filters[field.model] = this.normalizeDateYMD(value)
      this.autoSearch && this.applyFilters()
    },
    onDateInput (field, displayValue) {
      if (!displayValue) this.filters[field.model] = null
      this.autoSearch && this.applyFilters()
    },
    formatDateRangeForDisplay (range) {
      if (!range || !range.from || !range.to) return ''
      return `${this.toBRDate(range.from)} — ${this.toBRDate(range.to)}`
    },
    onDateRangePick (field, value) {
      this.filters[field.model] = {
        from: this.normalizeDateYMD(value?.from),
        to:   this.normalizeDateYMD(value?.to)
      }
      this.autoSearch && this.applyFilters()
    },

    currencyDisplay (field, v) {
      const cur = field.currency || 'BRL'
      if (v === '' || v === null || v === undefined || Number.isNaN(Number(v))) return ''
      try { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur }).format(Number(v)) } catch { return String(v) }
    },
    onCurrencyInput (field, display, which) {
      const cleaned = String(display || '').replace(/[^\d,.-]/g,'')
      const normalized = cleaned.replace(/\./g,'').replace(',', '.')
      const n = Number(normalized)
      if (field.type === 'currencyrange') {
        const obj = this.filters[field.model] || {}
        obj[which] = Number.isNaN(n) ? null : n
        this.$set?.(this.filters, field.model, obj) || (this.filters[field.model] = { ...obj })
      } else {
        this.filters[field.model] = Number.isNaN(n) ? null : n
      }
      this.autoSearch && this.applyFilters()
    },
    ensureRange (field) {
      if (!this.filters[field.model]) {
        const obj = { min: null, max: null }
        this.$set?.(this.filters, field.model, obj) || (this.filters[field.model] = obj)
      }
      return this.filters[field.model]
    },

    normalizeOptions (opts, field) {
      if (!opts) return []
      const lbl = field.optionLabel || 'label'
      const val = field.optionValue || 'value'
      return opts.map(o => (typeof o === 'object' ? o : { [lbl]: String(o), [val]: o }))
    },
    async filterLookup (field, val, update, abort) {
      if (typeof field.fetchOptions !== 'function') {
        update(() => { this.lookupCache[field.model] = this.normalizeOptions(field.options || [], field) }); return
      }
      this.lookupLoading = { ...this.lookupLoading, [field.model]: true }
      try {
        const ctx = { filters: this.filters }
        const list = await field.fetchOptions(val, ctx)
        update(() => { this.lookupCache[field.model] = this.normalizeOptions(list || [], field) })
      } catch (e) { console.error('lookup error', e); abort() }
      finally { this.lookupLoading = { ...this.lookupLoading, [field.model]: false } }
    },
    wireDepends () {
      (this.filterFields || []).filter(f => f.type === 'lookup' && f.dependsOn).forEach(f => {
        this.$watch(() => this.filters[f.dependsOn], (n, o) => {
          if (n === o) return
          this.filters[f.model] = null
          this.lookupCache[f.model] = []
          this.autoSearch && this.applyFilters()
        })
      })
    },

    passesText (cell, needle) { if (!needle) return true; return this.normalizeStr(cell).includes(this.normalizeStr(needle)) },
    inNumberRange (n, range) { if (n == null) return false; const x = Number(n); const minOk = (range?.min == null) || (x >= Number(range.min)); const maxOk = (range?.max == null) || (x <= Number(range.max)); return minOk && maxOk },
    applyFilters () {
      this.pagination.page = 1
      const f = this.filters
      const gs = this.normalizeStr(this.globalSearch)
      const rows = this.itemsRaw.filter(row => {
        for (const field of this.filterFields) {
          const model = field.model
          const val = f[model]
          if (val === undefined || val === null || val === '' || (Array.isArray(val) && !val.length)) continue
          const get = (key) => (typeof key === 'function' ? key(row) : row[key])
          switch (field.type) {
            case 'number': if (Number(get(model)) !== Number(val)) return false; break
            case 'numberrange': if (!this.inNumberRange(get(model), val)) return false; break
            case 'currency': if (Number(get(model)) !== Number(val)) return false; break
            case 'currencyrange': if (!this.inNumberRange(get(model), val)) return false; break
            case 'select':
            case 'lookup': if (get(model) !== val) return false; break
            case 'multiselect': if (!val.includes(get(model))) return false; break
            case 'daterange': {
              const cellYMD = this.normalizeDateYMD(get(field.modelDateKey || model))
              const from = val?.from, to = val?.to
              if (from && cellYMD && cellYMD < from) return false
              if (to   && cellYMD && cellYMD > to)   return false
              break
            }
            case 'date': {
              const cellYMD = this.normalizeDateYMD(get(model))
              if (cellYMD !== val) return false
              break
            }
            case 'switch':
            case 'checkbox': if (!!get(model) !== !!val) return false; break
            default: if (!this.passesText(get(model), val)) return false
          }
        }
        if (gs) {
          const chunk = (this.columns || []).map(col => {
            const v = typeof col.field === 'function' ? col.field(row) : row[col.field || col.name]
            return String(v ?? '')
          }).join(' • ')
          if (!this.normalizeStr(chunk).includes(gs)) return false
        }
        return true
      })
      this.itemsFiltered = rows
      this.filteredCount = rows.length
    },

    exportCsv () {
      if (!this.itemsFiltered.length) {
        this.$q.notify({ type: 'warning', message: 'Nada para exportar', position: 'top-right', timeout: 2000 })
        return
      }
      const cols = this.normalizedColumns
      const header = cols.map(c => `"${(c.label || c.name).replace(/"/g, '""')}"`).join(';')
      const lines = this.itemsFiltered.map(row =>
        cols.map(c => {
          const v = (typeof c.field === 'function') ? c.field(row) : row[c.field || c.name]
          const s = v == null ? '' : (c.type === 'date' ? this.toBRDate(v) : String(v))
          return `"${s.replace(/"/g, '""')}"`
        }).join(';')
      )
      const csv = [header, ...lines].join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = (this.title || 'consulta') + '.csv'; a.click()
      URL.revokeObjectURL(url)
    },

    clearFilters () {
      this.filters = {}
      ;(this.filterFields || []).forEach(f => {
        if (f.type === 'multiselect') this.filters[f.model] = []
        else if (['currencyrange','numberrange'].includes(f.type)) this.filters[f.model] = { min: null, max: null }
        else if (f.type === 'daterange') this.filters[f.model] = { from: null, to: null }
        else this.filters[f.model] = null
      })
      this.globalSearch = ''
      this.lookupCache = {}
      this.applyFilters()
    },
    removeChip (chip) {
      const f = this.filterFields.find(x => x.model === chip.key)
      if (!f) return
      if (['currencyrange','numberrange'].includes(f.type)) this.filters[chip.key] = { min: null, max: null }
      else if (f.type === 'daterange') this.filters[chip.key] = { from: null, to: null }
      else this.filters[chip.key] = f.multiple ? [] : null
      this.applyFilters()
    },
    debouncedFilter () { clearTimeout(this.debounceTimer); this.debounceTimer = setTimeout(() => this.applyFilters(), 350) },

    async reload () {
      this.loading = true
      try {
        const data = await this.service.getAll()
        this.itemsRaw = data.items || data || []
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        this.$q.notify({ type: 'negative', message: 'Erro ao carregar dados', position: 'top-right', timeout: 3000 })
      } finally {
        this.loading = false
        this.applyFilters()
      }
    }
  },
  mounted () {
    this.filters = { ...this.initialFilters }
    this.wireDepends()
    this.reload()
  }
}
</script>

<style scoped>
.page-stack{
  display:flex;
  flex-direction:column;
  height:100%;
  overflow:hidden;
}

.filters-card{
  flex:0 0 auto;
  border-radius:14px;
}

.filters-grid{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap:10px 12px;
}
.field{ min-width:0; }
.field-wide{ grid-column: 1 / -1; }

.table-card{
  flex:1 1 auto;
  display:flex;
  min-height:0;
  border-radius:14px;
  margin-top:12px;
  overflow:hidden;
}
.table-scroll{
  flex:1 1 auto;
  min-height:0;
  overflow:auto;
}

.table-header th{
  position:sticky; top:0; z-index:3;
  background:var(--q-table-bg,#fff);
  backdrop-filter:saturate(180%) blur(2px);
}

.q-table th, .q-table td { white-space:nowrap; text-align:left; }
.cell-ellipsis{ max-width:280px; overflow:hidden; text-overflow:ellipsis; }
</style>
