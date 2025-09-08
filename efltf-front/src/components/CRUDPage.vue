<template>
  <!-- q-page já respeita o header/toolbar do Quasar -->
  <q-page class="q-pa-md page-grid">
    <!-- COLUNA: FORM -->
    <div class="form-col">
      <q-card class="q-pa-md form-card">
        <q-card-section class="q-pa-none q-mb-md">
          <div class="text-h6">{{ formData.id ? 'Editar Registro' : 'Novo Registro' }}</div>
          <div class="text-caption text-grey-7">Preencha os campos e salve para atualizar a listagem</div>
        </q-card-section>

        <q-form ref="form" @submit.prevent="handleSubmit" class="form-body">
          <!-- ID -->
          <q-input
            v-model="formData.id"
            label="ID"
            type="number"
            @blur="fetchById"
            hint="Digite um ID para buscar"
            dense
            outlined
            class="q-mb-sm"
          />

          <!-- CAMPOS DINÂMICOS -->
          <div v-for="field in formFields" :key="field.model" class="q-mb-sm">
            <!-- TEXT / NUMBER (padrão) -->
            <q-input
              v-if="isTextLike(field)"
              v-model="formData[field.model]"
              :label="withRequiredAsterisk(field)"
              :type="field.type === 'number' ? 'number' : (field.type || 'text')"
              :maxlength="field.maxlength"
              :rules="getRules(field)"
              lazy-rules
              dense
              outlined
            />

            <!-- DATA -->
            <q-input
              v-else-if="field.type === 'date'"
              :model-value="formatDateForDisplay(formData[field.model], field)"
              @update:model-value="onDateInput(field, $event)"
              :label="withRequiredAsterisk(field)"
              dense
              outlined
              readonly
              clearable
              :rules="getRules(field)"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="event" />
              </template>
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="formData[field.model]"
                  @update:model-value="onDatePick(field, $event)"
                  :mask="field.format || 'YYYY-MM-DD'"
                  today-btn
                />
              </q-popup-proxy>
            </q-input>

            <!-- CURRENCY -->
            <q-input
              v-else-if="field.type === 'currency'"
              :model-value="currencyDisplay(field)"
              @update:model-value="onCurrencyInput(field, $event)"
              :label="withRequiredAsterisk(field)"
              dense
              outlined
              inputmode="decimal"
              :rules="getRules(field)"
              lazy-rules
              prefix="R$"
            >
              <template #append>
                <q-icon name="payments" />
              </template>
            </q-input>

            <!-- SELECT (opções fixas) -->
            <q-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.model]"
              :label="withRequiredAsterisk(field)"
              :options="normalizeOptions(field.options, field)"
              :option-label="field.optionLabel || 'label'"
              :option-value="field.optionValue || 'value'"
              emit-value
              map-options
              dense
              outlined
              clearable
              :rules="getRules(field)"
              lazy-rules
            />

            <!-- LOOKUP (busca assíncrona) -->
            <q-select
              v-else-if="field.type === 'lookup'"
              v-model="formData[field.model]"
              :label="withRequiredAsterisk(field)"
              use-input
              input-debounce="300"
              :options="lookupCache[field.model] || []"
              :option-label="field.optionLabel || 'label'"
              :option-value="field.optionValue || 'value'"
              emit-value
              map-options
              dense
              outlined
              clearable
              :loading="lookupLoading[field.model]"
              @filter="(val, update, abort) => filterLookup(field, val, update, abort)"
              :rules="getRules(field)"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">Sem resultados</q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- COLOR (QColor + popup) -->
            <q-input
              v-else-if="field.type === 'color'"
              :model-value="formData[field.model]"
              @update:model-value="val => formData[field.model] = normalizeColor(val, field)"
              :label="withRequiredAsterisk(field)"
              dense
              outlined
              clearable
              :rules="getRules(field)"
              lazy-rules
            >
              <template #prepend>
                <div
                  :style="{ width: '18px', height: '18px', borderRadius: '4px', background: formData[field.model] || '#ffffff', border: '1px solid rgba(0,0,0,0.2)' }"
                />
              </template>
              <template #append>
                <q-icon name="palette" />
              </template>
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-color
                  :model-value="formData[field.model] || '#ffffff'"
                  @update:model-value="val => formData[field.model] = normalizeColor(val, field)"
                  :format="(field.format || 'hex')"
                  default-view="palette"
                  no-footer
                />
              </q-popup-proxy>
            </q-input>

            <!-- FALLBACK: text -->
            <q-input
              v-else
              v-model="formData[field.model]"
              :label="withRequiredAsterisk(field)"
              :maxlength="field.maxlength"
              :rules="getRules(field)"
              lazy-rules
              dense
              outlined
            />
          </div>

          <div class="row q-gutter-sm q-mt-sm">
            <q-btn type="submit" label="Salvar" color="secondary" no-caps unelevated />
            <q-btn label="Limpar" color="grey-7" outline @click="clearForm" no-caps />
          </div>
        </q-form>
      </q-card>
    </div>

    <!-- COLUNA: TABELA -->
    <div class="table-col">
      <q-card class="table-card">
        <q-card-section class="q-pa-sm table-toolbar">
          <div class="row items-center q-col-gutter-sm wrap">
            <div class="col-12 col-sm-8 col-md-9">
              <q-input
                v-model="filter"
                dense
                outlined
                debounce="300"
                placeholder="Filtrar…"
                clearable
                class="q-mb-none"
                :input-class="'text-body2'"
              >
                <template #prepend><q-icon name="search" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4 col-md-3 flex items-center justify-end q-gutter-xs">
              <q-btn flat dense round icon="refresh" @click="fetchAll">
                <q-tooltip>Recarregar</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="density_small" @click="dense = !dense">
                <q-tooltip>{{ dense ? 'Espaçamento padrão' : 'Modo denso' }}</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>

        <!-- Scroll apenas no miolo -->
        <div class="table-scroll">
          <q-table
            :rows="items"
            :columns="normalizedColumns"
            row-key="id"
            :rows-per-page-options="[5, 10, 15, 20]"
            v-model:pagination="pagination"
            :filter="filter"
            :dense="dense"
            flat
            separator="cell"
            table-header-class="table-header"
            :row-class="rowClass"
            :no-data-label="'Nenhum registro encontrado'"
            :no-results-label="'Nenhum resultado para o filtro'"
          >
            <template #body-cell-__actions="scope">
              <q-td :props="scope" class="action-column sticky-left">
                <div class="row no-wrap q-gutter-xs">
                  <q-btn
                    label="Editar"
                    color="black"
                    text-color="white"
                    size="sm"
                    dense
                    no-caps
                    unelevated
                    @click="editItem(scope.row)"
                    class="btn-action"
                  />
                  <q-btn
                    label="Excluir"
                    color="red"
                    size="sm"
                    dense
                    no-caps
                    outline
                    @click="confirmDelete(scope.row.id)"
                    class="btn-action"
                  />
                </div>
              </q-td>
            </template>

            <template #body-cell="scope">
              <q-td :props="scope" class="cell-ellipsis">
                <span :title="String(scope.value ?? '')">{{ scope.value }}</span>
              </q-td>
            </template>

            <template #bottom>
              <div class="row items-center justify-between full-width q-pa-sm">
                <div class="text-caption text-grey-7">
                  {{ items.length }} registro(s)
                </div>
                <q-pagination
                  v-model="pagination.page"
                  :max="Math.max(1, Math.ceil((items.length || 0) / (pagination.rowsPerPage || 10)))"
                  max-pages="6"
                  boundary-numbers
                  direction-links
                  dense
                />
              </div>
            </template>
          </q-table>
        </div>

        <q-separator v-if="!items.length" />
        <q-card-section v-if="!items.length" class="text-center text-grey-7">
          <q-icon name="inventory_2" size="40px" class="q-mb-sm" />
          <div class="text-body2">Nenhum registro por aqui.</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- CONFIRMAÇÃO EXCLUSÃO -->
    <q-dialog v-model="confirm.open">
      <q-card>
        <q-card-section class="text-h6">Confirmar exclusão</q-card-section>
        <q-card-section class="text-body2">
          Tem certeza que deseja excluir este registro?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="red" label="Excluir" @click="deleteItem(confirm.id)" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default {
  props: {
    service: { type: Object, required: true },
    formFields: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] }
  },
  data () {
    return {
      $q: useQuasar(),
      router: useRouter(),
      items: [],
      pagination: { page: 1, rowsPerPage: 10 },
      filter: '',
      dense: true,
      formData: { id: null },
      confirm: { open: false, id: null },
      suppressDependsReset: false,
      lookupCache: {},
      lookupLoading: {}
    }
  },
  computed: {
    normalizedColumns () {
      const baseWidth = 140
      const actionCol = {
        name: '__actions',
        label: 'Ações',
        field: '__actions',
        align: 'left',
        sortable: false,
        headerStyle: `min-width:${baseWidth}px; left:0; z-index:2;`,
        style: `min-width:${baseWidth}px;`
      }
      const others = (this.columns || []).map(c => ({
        ...c,
        align: c.align || 'left',
        sortable: c.sortable ?? true,
        headerStyle: (c.headerStyle || '') + ';min-width:120px;',
        style: (c.style || '') + ';min-width:120px;'
      }))
      return [actionCol, ...others]
    }
  },
  methods: {
    withRequiredAsterisk (field) {
      return field.required ? `${field.label} *` : field.label
    },
    isTextLike (field) {
      return !field.type || ['text', 'number', 'password', 'email', 'tel'].includes(field.type)
    },
    getRules (field) {
      const rules = []

      if (field.required) {
        rules.push(v => {
          if (field.type === 'number' || field.type === 'currency') {
            return (v !== null && v !== '' && !Number.isNaN(Number(v))) || 'Campo obrigatório'
          }
          const s = (v ?? '').toString().trim()
          return s.length > 0 || 'Campo obrigatório'
        })
      }

      if (field.maxlength) {
        rules.push(v => {
          if (v == null) return true
          return String(v).length <= field.maxlength || `Máximo de ${field.maxlength} caracteres`
        })
      }

      if (field.type === 'number') {
        rules.push(v => (v === '' || v === null || !Number.isNaN(Number(v))) || 'Número inválido')
      }

      if (field.type === 'color') {
        rules.push(v => {
          if (!v) return true
          return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v) || 'Cor inválida'
        })
      }

      return rules
    },

    formatDateForDisplay (val, field) {
      const mask = field.format || 'YYYY-MM-DD'
      const disp = field.displayFormat || 'DD/MM/YYYY'
      if (!val) return ''
      if (mask === 'YYYY-MM-DD' && disp === 'DD/MM/YYYY') {
        const [y, m, d] = String(val).split('-')
        return (y && m && d) ? `${d}/${m}/${y}` : ''
      }
      return val
    },
    onDatePick (field, value) {
      this.formData[field.model] = value
    },
    onDateInput (field, displayValue) {
      if (!displayValue) {
        this.formData[field.model] = null
      }
    },

    // ========= CURRENCY =========
    currencyDisplay (field) {
      const cur = field.currency || 'BRL'
      const v = this.formData[field.model]
      if (v === '' || v === null || v === undefined || Number.isNaN(Number(v))) return ''
      try {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur }).format(Number(v))
      } catch {
        return String(v)
      }
    },
    onCurrencyInput (field, display) {
      if (!display) {
        this.formData[field.model] = null
        return
      }
      const cleaned = String(display).replace(/[^\d,.-]/g, '')
      const normalized = cleaned.replace(/\./g, '').replace(',', '.')
      const n = Number(normalized)
      this.formData[field.model] = Number.isNaN(n) ? null : n
    },

    normalizeOptions (opts, field) {
      if (!opts) return []
      const lbl = field.optionLabel || 'label'
      const val = field.optionValue || 'value'
      return opts.map(o => (typeof o === 'object' ? o : { [lbl]: String(o), [val]: o }))
    },

    async filterLookup (field, val, update, abort) {
      if (typeof field.fetchOptions !== 'function') {
        update(() => {
          this.lookupCache[field.model] = this.normalizeOptions(field.options || [], field)
        })
        return
      }
      this.lookupLoading = { ...this.lookupLoading, [field.model]: true }
      try {
        const ctx = { formData: this.formData }
        const list = await field.fetchOptions(val, ctx)
        update(() => {
          this.lookupCache[field.model] = this.normalizeOptions(list || [], field)
        })
      } catch (e) {
        console.error('lookup error', e)
        abort()
      } finally {
        this.lookupLoading = { ...this.lookupLoading, [field.model]: false }
      }
    },

    // Observa campos com dependsOn e reseta quando a dependência muda
    wireDepends () {
      (this.formFields || [])
        .filter(f => f.type === 'lookup' && f.dependsOn)
        .forEach(f => {
          this.$watch(
            () => this.formData[f.dependsOn],
            (newVal, oldVal) => {
              if (this.suppressDependsReset) return;       // <— não limpe durante hidratação
              if (newVal === oldVal) return;
              this.formData[f.model] = null;
              this.lookupCache[f.model] = [];
            },
            { immediate: false }
          )
        })
    },

    // Observa campos com deriveFrom/deriveValue e atualiza automaticamente
    wireDerived () {
      (this.formFields || [])
        .filter(f => typeof f.deriveValue === 'function' && f.deriveFrom)
        .forEach(f => {
          this.$watch(
            () => this.formData[f.deriveFrom],
            async () => {
              try {
                const v = await f.deriveValue(this.formData)
                this.formData[f.model] = v
              } catch (e) {
                console.warn('deriveValue falhou para', f.model, e)
              }
            },
            { immediate: true }
          )
        })
    },

    // ========= LOOKUP HYDRATION =========
    async ensureLookupOption(field, value) {
      if (value === null || value === undefined || value === '') return

      const model  = field.model
      const lblKey = field.optionLabel || 'label'
      const valKey = field.optionValue || 'value'

      const cached = this.lookupCache[model] || []
      const exists = cached.some(opt => (opt?.[valKey] ?? opt?.value) === value)
      if (exists) return

      let option = null
      const mustCheckOwnership = !!field.dependsOn // se tem dependsOn, não use rótulo “inventado”

      // Só use composições locais se NÃO houver dependsOn (pra não burlar a validação)
      if (!mustCheckOwnership && field.labelProp && this.formData?.[field.labelProp]) {
        option = { [lblKey]: String(this.formData[field.labelProp]), [valKey]: value }
      }
      if (!mustCheckOwnership && Array.isArray(field.composeLabelFrom) && field.composeLabelFrom.length) {
        const sep = field.composeSeparator ?? ' - '
        const parts = field.composeLabelFrom
          .map(k => this.formData?.[k])
          .filter(v => v !== undefined && v !== null && String(v).trim() !== '')
        if (parts.length) {
          option = { [lblKey]: parts.join(sep), [valKey]: value }
        }
      }

      // Sempre tente validar via resolveOption com ctx (especialmente quando tem dependsOn)
      if (!option) {
        try {
          if (typeof field.resolveOption === 'function') {
            option = await field.resolveOption(value, { formData: this.formData }) // <<<<<< AQUI
          } else if (typeof field.fetchById === 'function') {
            option = await field.fetchById(value)
          }
        } catch (e) {
          console.warn(`Falha ao resolver option (${model}) via API:`, e)
        }
      }

      // Se resolveOption retornou null => inválido (ex.: endereço não pertence ao cliente)
      if (option === null) {
        this.formData[model] = null
        this.$q?.notify?.({
          type: 'warning',
          message: 'O endereço selecionado não pertence ao cliente atual.',
          position: 'top-right',
          timeout: 2500
        })
        return
      }

      // fallback final (evite usar em campos com dependsOn)
      if (!option) {
        option = { [lblKey]: String(value), [valKey]: value }
      }

      const normalized = typeof option === 'object'
        ? option
        : { [lblKey]: String(option), [valKey]: value }

      this.lookupCache = {
        ...this.lookupCache,
        [model]: [...cached, normalized]
      }
    },

    async hydrateLookupsFromForm() {
      const tasks = (this.formFields || [])
        .filter(f => f.type === 'lookup')
        .map(f => this.ensureLookupOption(f, this.formData[f.model]))
      await Promise.all(tasks)
    },

    // ========= CRUD =========
    async fetchAll () {
      try {
        const data = await this.service.getAll()
        this.items = data.items || []
      } catch (err) {
        console.error('Erro ao buscar registros:', err)
        this.$q.notify({ type: 'negative', message: 'Erro ao buscar registros', position: 'top-right', timeout: 3000 })
      }
    },

    async fetchById () {
      if (!this.formData.id && this.formData.id !== 0) return
        try {
          const data = await this.service.getById(this.formData.id)
          if (data.item) {
            this.suppressDependsReset = true; 
            this.formData = { ...data.item }
            await this.$nextTick()
            await this.hydrateLookupsFromForm()
            this.suppressDependsReset = false;
            this.$refs.form?.resetValidation()
          } else {
            this.clearForm()
          }
      } catch (err) {
        console.error('Erro ao buscar registro:', err)
        this.$q.notify({ type: 'negative', message: 'Erro ao buscar registro', position: 'top-right', timeout: 3000 })
      }
    },

    async handleSubmit () {
      const ok = await this.$refs.form.validate()
      if (!ok) {
        this.$q.notify({ type: 'warning', message: 'Corrija os campos destacados.', position: 'top-right', timeout: 2500 })
        return
      }
      try {
        const payload = { ...this.formData }
        Object.keys(payload).forEach(k => {
          if (typeof payload[k] === 'string') payload[k] = payload[k].trim()
        })
        if (payload.id) {
          await this.service.update({ ...payload })
          this.$q.notify({ type: 'positive', message: 'Registro atualizado com sucesso!', position: 'top-right', timeout: 2500 })
        } else {
          await this.service.create({ ...payload })
          this.$q.notify({ type: 'positive', message: 'Registro criado com sucesso!', position: 'top-right', timeout: 2500 })
        }
        this.clearForm()
        await this.fetchAll()
      } catch (err) {
        console.error('Erro ao salvar registro:', err)
        this.$q.notify({ type: 'negative', message: 'Erro ao salvar registro', position: 'top-right', timeout: 3000 })
      }
    },

    editItem (item) {
      this.suppressDependsReset = true;
      this.formData = { ...item }
      this.$nextTick(async () => {
        await this.hydrateLookupsFromForm()
        this.suppressDependsReset = false;
        this.$refs.form?.resetValidation()
      })
    },

    confirmDelete (id) {
      this.confirm = { open: true, id }
    },
    async deleteItem (id) {
      try {
        await this.service.delete(id)
        this.$q.notify({ type: 'positive', message: 'Registro excluído com sucesso!', position: 'top-right', timeout: 2500 })
        await this.fetchAll()
      } catch (err) {
        console.error('Erro ao excluir registro:', err)
        this.$q.notify({ type: 'negative', message: 'Erro ao excluir registro ' + err, position: 'top-right', timeout: 3000 })
      }
    },

    clearForm () {
      this.formData = { id: null }
      this.formFields.forEach(f => (this.formData[f.model] = null))
      this.$refs.form?.resetValidation()
    },

    rowClass (_, rowIndex) {
      return rowIndex % 2 === 0 ? 'row-even' : 'row-odd'
    }
  },
  mounted () {
    this.fetchAll()
    this.wireDepends()
    this.wireDerived()
  }
}
</script>

<style scoped>
/* GRID principal: 2 colunas, altura = área útil do q-page */
.page-grid{
  display:grid;
  grid-template-columns: minmax(320px, 520px) 1fr;
  gap:12px;
  height:100%;        /* q-page já calcula o espaço útil (desconta header/drawer) */
  overflow:hidden;    /* evita “invadir” o header */
}

/* Coluna do form */
.form-col{ min-width:0; }
.form-card{
  height:100%;
  display:flex;
  flex-direction:column;
  overflow:hidden;
}
.form-body{
  flex:1 1 auto;
  min-height:0;
  overflow:auto;      /* rolagem só do formulário quando precisar */
}

/* Coluna da tabela */
.table-col{
  min-width:0;
  display:flex;
  flex-direction:column;
}
.table-card{
  flex:1 1 auto;
  display:flex;
  min-height:0;
  border-radius:14px;
  overflow:hidden;    /* borda arredondada + recorte do conteúdo */
}
.table-toolbar{
  border-bottom:1px solid rgba(0,0,0,0.06);
  flex:0 0 auto;
}

/* Scroll só no miolo da tabela */
.table-scroll{
  flex:1 1 auto;
  min-height:0;
  overflow:auto;
}

/* Header sticky olhando pro container com overflow (table-scroll) */
.table-header th{
  position:sticky;
  top:0;
  z-index:3;
  background:var(--q-table-bg,#fff);
  backdrop-filter:saturate(180%) blur(2px);
}

/* Ações fixas à esquerda */
.sticky-left{
  position:sticky;
  left:0;
  z-index:2;
  background:var(--q-table-row-bg,#fff);
  box-shadow:1px 0 0 rgba(0,0,0,0.06);
}

/* Visual */
.q-table th, .q-table td { white-space:nowrap; text-align:left; }
.cell-ellipsis{ max-width:280px; overflow:hidden; text-overflow:ellipsis; }
.q-table tbody tr{ transition:background-color .12s ease; }
.row-even{ background:#fafafa; }
.q-table tbody tr:hover{ background:#f1f5f9; }
.action-column{ min-width:160px; }
@media (max-width:1023px){ .action-column{ min-width:140px; } }
@media (max-width:599px){ .action-column{ min-width:128px; } }
.btn-action{ min-width:86px; }
</style>
