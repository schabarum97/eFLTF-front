<template>
  <q-page class="q-pa-md page-grid">
    <!-- ========== FORM (MAIOR) ========== -->
    <div class="form-col">
      <q-card class="q-pa-md form-card">
        <q-card-section class="q-pa-none q-mb-sm">
          <div class="text-h6">Ordem de Serviço — Cliente + Endereço + OS</div>
          <div class="text-caption text-grey-7">
            Você pode selecionar registros já existentes ou cadastrar novos na mesma tela.
          </div>
        </q-card-section>

        <q-separator class="q-mb-md" />

        <q-form ref="formAll" @submit.prevent="saveAll" class="form-body q-gutter-sm">

          <!--CLIENTE-->
          <q-expansion-item
            v-model="ui.open.cliente"
            icon="person"
            label="Cliente"
            caption="Escolha um cliente existente ou cadastre um novo"
            dense
            expand-separator
            default-opened
          >
            <div class="row q-col-gutter-sm q-mb-sm">
              <q-select
                class="col-12"
                v-model="clienteForm.id"
                label="Cliente existente (buscar por nome/ID)"
                use-input
                input-debounce="300"
                :options="clienteLookupOptions"
                :option-label="o => o?.label ?? ''"
                :option-value="o => o?.value ?? null"
                emit-value
                map-options
                clearable
                dense
                outlined
                :loading="ui.loading.lookupCliente"
                @filter="filterCliente"
                @update:model-value="onPickCliente"
              >
                <template #prepend><q-icon name="search" /></template>
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sem resultados</q-item-section></q-item>
                </template>
              </q-select>

              <q-separator />

              <div class="col-12 text-subtitle2">Novo cliente (opcional)</div>
              <q-input class="col-12 col-sm-6" v-model="clienteForm.cnpj" label="CPF/CNPJ" dense outlined />
              <q-input class="col-12 col-sm-6" v-model="clienteForm.nome" label="Nome *" dense outlined :rules="[req]" />
              <q-input class="col-4 col-sm-2" v-model="clienteForm.ddi" label="DDI" dense outlined />
              <q-input class="col-4 col-sm-2" v-model="clienteForm.ddd" label="DDD" dense outlined />
              <q-input class="col-12 col-sm-8" v-model="clienteForm.fone" label="Telefone" dense outlined />

              <div class="col-12">
                <q-btn
                  :disable="!canCreateCliente"
                  color="secondary"
                  label="Salvar/Atualizar Cliente"
                  no-caps
                  unelevated
                  @click="saveClienteInline"
                />
                <q-btn flat color="grey-7" no-caps class="q-ml-sm" label="Limpar Cliente" @click="clearCliente" />
              </div>
            </div>
          </q-expansion-item>

          <q-separator class="q-my-sm" />

          <!--ENDEREÇO-->
          <q-expansion-item
            v-model="ui.open.endereco"
            icon="home"
            :disable="!clienteIdResolvido"
            label="Endereço do Cliente"
            :caption="clienteIdResolvido ? 'Filtra por cliente' : 'Selecione ou salve um cliente primeiro'"
            dense
            expand-separator
          >
            <div class="row q-col-gutter-sm q-mb-sm">
              <q-select
                class="col-12"
                v-model="enderecoForm.id"
                :label="clienteIdResolvido ? 'Endereço existente do cliente' : 'Endereço (bloqueado até escolher cliente)'"
                use-input
                input-debounce="300"
                :options="endLookupOptions"
                :option-label="o => o?.label ?? ''"
                :option-value="o => o?.value ?? null"
                emit-value
                map-options
                clearable
                dense
                outlined
                :disable="!clienteIdResolvido"
                :loading="ui.loading.lookupEndereco"
                @filter="filterEndereco"
                @update:model-value="onPickEndereco"
              >
                <template #prepend><q-icon name="search" /></template>
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sem resultados</q-item-section></q-item>
                </template>
              </q-select>

              <q-separator />

              <div class="col-12 text-subtitle2">Novo endereço (opcional)</div>

              <!-- Campos cli_* iguais à tela de Endereço -->
              <q-input class="col-12 col-sm-8" v-model="enderecoForm.cli_logradouro" label="Logradouro *" dense outlined :rules="[reqIfNewEndereco]" />
              <q-input class="col-6 col-sm-2" v-model="enderecoForm.cli_numero" label="Número" dense outlined />
              <q-input class="col-6 col-sm-2" v-model="enderecoForm.cli_cep" label="CEP" dense outlined />
              <q-input class="col-12 col-sm-6" v-model="enderecoForm.cli_bairro" label="Bairro" dense outlined />
              <q-input class="col-12 col-sm-6" v-model="enderecoForm.cli_endereco" label="Complemento" dense outlined />

              <q-select
                class="col-12 col-sm-3"
                v-model="enderecoForm.uf_id"
                label="UF"
                :options="ufOptions"
                option-label="sigla"
                option-value="id"
                emit-value
                map-options
                dense
                outlined
                clearable
                :loading="ui.loading.uf"
                @update:model-value="() => { enderecoForm.cid_id = null }"
              />
              <q-select
                class="col-12 col-sm-9"
                v-model="enderecoForm.cid_id"
                label="Cidade"
                use-input
                input-debounce="300"
                :options="cidadeLookupOptions"
                :option-label="o => o?.label ?? ''"
                :option-value="o => o?.value ?? null"
                emit-value
                map-options
                dense
                outlined
                clearable
                :loading="ui.loading.lookupCidade"
                @filter="filterCidade"
              >
                <template #prepend><q-icon name="location_city" /></template>
              </q-select>

              <div class="col-12">
                <q-btn
                  :disable="!canCreateEndereco"
                  :loading="ui.loading.savingEndereco"
                  color="secondary"
                  label="Salvar/Atualizar Endereço"
                  no-caps
                  unelevated
                  @click="saveEnderecoInline"
                />
                <q-btn flat color="grey-7" no-caps class="q-ml-sm" label="Limpar Endereço" @click="clearEndereco" />
              </div>
            </div>
          </q-expansion-item>

          <q-separator class="q-my-sm" />

          <!-- ORDEM -->
          <q-expansion-item
            v-model="ui.open.ordem"
            icon="assignment"
            label="Ordem de Serviço"
            :caption="enderecoIdResolvido ? 'Pronto para preencher' : 'Selecione/salve cliente e endereço antes'"
            dense
            expand-separator
          >
            <div class="row q-col-gutter-sm">
              <q-select
                class="col-12 col-sm-6"
                v-model="ordemForm.stt_id"
                label="Status"
                use-input
                input-debounce="300"
                :options="statusLookupOptions"
                :option-label="o => o?.label ?? ''"
                :option-value="o => o?.value ?? null"
                emit-value
                map-options
                dense outlined clearable
                :loading="ui.loading.status"
                @filter="filterStatus"
                @update:model-value="onPickStatus"
              >
                <template #prepend><q-icon name="inventory" /></template>
              </q-select>

              <q-select
                class="col-12 col-sm-6"
                v-model="ordemForm.usu_id"
                label="Responsável"
                use-input
                input-debounce="300"
                :options="responsavelLookupOptions"
                :option-label="o => o?.label ?? ''"
                :option-value="o => o?.value ?? null"
                emit-value
                map-options
                dense
                outlined
                clearable
                :loading="ui.loading.responsavel"
                @filter="filterResponsavel"
              >
                <template #prepend><q-icon name="badge" /></template>
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sem resultados</q-item-section></q-item>
                </template>
              </q-select>

              <!-- Data em DD/MM/YYYY -->
              <q-input class="col-6 col-sm-3" v-model="ordemForm.dataBR" label="Data" dense outlined readonly clearable>
                <template #prepend><q-icon name="event" /></template>
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="ordemForm.dataBR" mask="DD/MM/YYYY" today-btn />
                </q-popup-proxy>
              </q-input>

              <q-input class="col-6 col-sm-3" v-model="ordemForm.hora" label="Hora" dense outlined readonly clearable>
                <template #prepend><q-icon name="schedule" /></template>
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-time v-model="ordemForm.hora" mask="HH:mm" format24h />
                </q-popup-proxy>
              </q-input>

              <q-input class="col-12" v-model="ordemForm.observacao" type="textarea" autogrow label="Observação" dense outlined :maxlength="500" />
            </div>
          </q-expansion-item>

          <q-separator class="q-my-sm" />

          <!-- PAGAMENTOS -->
          <q-expansion-item
            v-model="uiPag.open.pagamentos"
            icon="payments"
            label="Pagamentos da OS"
            :caption="ordemForm.id ? 'Gerencie as parcelas e formas de pagamento' : 'Salve a OS primeiro para cadastrar pagamentos'"
            dense
            expand-separator
          >
            <div class="q-mb-sm">
              <div class="text-subtitle2 q-mb-xs">Novo lote de parcelas</div>
              <div class="row q-col-gutter-sm items-end">
                <q-select
                  class="col-12 col-sm-4"
                  v-model="pagamentoForm.fpg_id"
                  label="Forma de Pagamento"
                  :options="formaPagOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  dense
                  outlined
                  clearable
                  :loading="uiPag.loading.lookupForma"
                  @filter="filterFormaPag"
                >
                  <template #prepend><q-icon name="payment" /></template>
                </q-select>

                <q-input class="col-6 col-sm-2" v-model.number="pagamentoForm.valor" type="number" step="0.01" min="0" label="Valor total" dense outlined>
                  <template #prepend><q-icon name="attach_money" /></template>
                </q-input>

                <q-input class="col-6 col-sm-2" v-model.number="pagamentoForm.parcela" type="number" min="1" label="Nº de parcelas" dense outlined>
                  <template #prepend><q-icon name="format_list_numbered" /></template>
                </q-input>

                <!-- Vencimento em DD/MM/YYYY -->
                <q-input class="col-6 col-sm-2" v-model="pagamentoForm.vencimentoBR" label="Vencimento base" dense outlined readonly clearable>
                  <template #prepend><q-icon name="event" /></template>
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date v-model="pagamentoForm.vencimentoBR" mask="DD/MM/YYYY" today-btn />
                  </q-popup-proxy>
                </q-input>

                <q-select
                  class="col-6 col-sm-2"
                  v-model="pagamentoForm.pago"
                  label="Pago?"
                  :options="[{label:'Não',value:'N'},{label:'Sim',value:'S'}]"
                  emit-value
                  map-options
                  dense
                  outlined
                >
                  <template #prepend><q-icon :name="pagamentoForm.pago==='S'?'check_circle':'radio_button_unchecked'" /></template>
                </q-select>

                <div class="col-12 col-sm-12">
                  <q-btn
                    color="secondary"
                    no-caps
                    unelevated
                    icon="add"
                    label="Gerar parcelas"
                    :disable="!canCreateLote"
                    :loading="uiPag.loading.creatingLote"
                    @click="createLotePagamentos"
                  />
                  <q-btn flat color="grey-7" no-caps class="q-ml-sm" label="Limpar" @click="clearPagamentoForm" />
                </div>
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <div class="row items-center justify-between q-mb-xs">
              <div class="text-subtitle2">Parcelas cadastradas</div>
              <div class="text-caption text-grey-7">
                Total: <b>R$ {{ pagamentosTotal.toFixed(2) }}</b> &nbsp;•&nbsp;
                Pago: <b>R$ {{ pagamentosPagoTotal.toFixed(2) }}</b> &nbsp;•&nbsp;
                Em aberto: <b>R$ {{ pagamentosAbertoTotal.toFixed(2) }}</b>
              </div>
            </div>

            <q-table
              :rows="pagamentos.items"
              :columns="pagColumns"
              row-key="id"
              :loading="pagamentos.loading"
              flat
              dense
              :rows-per-page-options="[5,10,15,20]"
            >
              <template #body-cell-__actions="scope">
                <q-td :props="scope" class="sticky-left action-td">
                  <q-btn
                    round dense flat
                    :icon="scope.row.pago === 'S' ? 'undo' : 'check'"
                    :color="scope.row.pago === 'S' ? 'warning' : 'positive'"
                    @click="togglePago(scope.row)"
                  >
                    <q-tooltip>{{ scope.row.pago === 'S' ? 'Estornar' : 'Marcar pago' }}</q-tooltip>
                  </q-btn>

                  <q-btn round dense flat icon="delete" color="negative" @click="deleteParcela(scope.row)">
                    <q-tooltip>Excluir parcela</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-expansion-item>

          <q-separator class="q-my-sm" />

          <div class="row q-gutter-sm q-mt-xs">
            <q-btn type="submit" color="primary" label="Salvar Tudo" no-caps unelevated :loading="ui.loading.savingAll" />
            <q-btn flat color="grey-7" label="Limpar Tudo" no-caps @click="clearAll" />
          </div>
        </q-form>
      </q-card>
    </div>

    <!-- GRID PAGAMENTOS -->
    <div class="table-col">
      <q-card class="table-card">
        <div class="table-scroll" ref="tableScroll">
          <q-table
            :rows="table.items"
            :columns="columns"
            row-key="id"
            :rows-per-page-options="[5,10,15,20]"
            v-model:pagination="table.pagination"
            :filter="table.filter"
            :dense="dense"
            flat
            separator="cell"
            table-header-class="table-header"
          >
            <!-- TOPO STICKY -->
            <template #top>
              <div class="table-top row items-center q-col-gutter-sm full-width">
                <q-input
                  v-model="table.filter"
                  dense
                  outlined
                  debounce="300"
                  placeholder="Filtrar…"
                  clearable
                  class="col"
                  :input-class="'text-body2'"
                  @update:model-value="updateHeaderOffset"
                >
                  <template #prepend><q-icon name="search" /></template>
                </q-input>

                <div class="row items-center no-wrap q-gutter-xs">
                  <q-btn flat dense round icon="refresh" @click="fetchOrdens"><q-tooltip>Recarregar</q-tooltip></q-btn>
                  <q-btn flat dense round icon="density_small" @click="() => { dense = !dense; updateHeaderOffset(); }"><q-tooltip>{{ dense ? 'Espaçamento padrão' : 'Modo denso' }}</q-tooltip></q-btn>
                  <q-btn flat dense round icon="menu" />
                </div>
              </div>
            </template>

            <!-- AÇÕES (ícones) -->
            <template #body-cell-__actions="scope">
              <q-td :props="scope" class="sticky-left action-td">
                <q-btn round dense flat icon="edit" aria-label="Editar" @click="loadOrderIntoForm(scope.row)">
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn round dense flat icon="delete" color="negative" aria-label="Excluir" @click="confirmDelete(scope.row.id)">
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template #bottom>
              <div class="row items-center justify-between full-width q-pa-sm">
                <div class="text-caption text-grey-7">{{ table.items.length }} registro(s)</div>
                <q-pagination
                  v-model="table.pagination.page"
                  :max="Math.max(1, Math.ceil((table.items.length || 0) / (table.pagination.rowsPerPage || 10)))"
                  max-pages="6"
                  boundary-numbers
                  direction-links
                  dense
                />
              </div>
            </template>
          </q-table>
        </div>

        <q-separator v-if="!table.items.length" />
        <q-card-section v-if="!table.items.length" class="text-center text-grey-7">
          <q-icon name="inventory_2" size="40px" class="q-mb-sm" />
          <div class="text-body2">Nenhuma OS por aqui.</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- CONFIRMAÇÃO EXCLUSÃO -->
    <q-dialog v-model="dialog.delete.open">
      <q-card>
        <q-card-section class="text-h6">Confirmar exclusão</q-card-section>
        <q-card-section class="text-body2">Deseja excluir esta OS?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="red" label="Excluir" @click="deleteOrdem(dialog.delete.id)" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useQuasar, date as qdate } from 'quasar'
import { Cliente } from 'src/services/ClienteService'
import { Endereco } from 'src/services/EnderecoService'
import { Cidade } from 'src/services/CidadeService'
import { Uf } from 'src/services/UfService'
import { Status } from 'src/services/StatusService'
import { Ordem } from 'src/services/OrdemService'
import { FormaPag } from 'src/services/FormaPagService'
import { OrdemPag } from 'src/services/OrdemPagService'
import { Responsavel } from 'src/services/ResponsavelService'

/* (ISO -> BR */
function isoToBR (iso) {
  if (!iso) return null
  return qdate.formatDate(iso, 'DD/MM/YYYY')
}
function brToISO (br) {
  if (!br) return null
  const d = qdate.extractDate(br, 'DD/MM/YYYY')
  return d ? qdate.formatDate(d, 'YYYY-MM-DD') : null
}

/* ENDEREÇO: API ⇄ FORM */
function apiEnderecoToForm (e = {}) {
  const ufId =
    e.uf_id ??
    e.ufId ??
    (e.uf && (e.uf.id ?? e.uf.uf_id)) ??
    (e.cidade && (e.cidade.uf_id ?? e.cidade.uf?.id)) ??
    (e.cid && (e.cid.uf_id ?? e.cid.uf?.id)) ??
    null

  const out = {
    id: e.id ?? e.end_id ?? null,
    cli_id: e.cli_id ?? e.cliente_id ?? null,
    cid_id: e.cid_id ?? e.cidade_id ?? e.cidade?.id ?? null,
    uf_id: ufId,

    cli_logradouro: e.cli_logradouro ?? e.end_logradouro ?? e.logradouro ?? '',
    cli_numero:     e.cli_numero     ?? e.end_numero     ?? e.numero     ?? '',
    cli_bairro:     e.cli_bairro     ?? e.end_bairro     ?? e.bairro     ?? '',
    cli_endereco:   e.cli_endereco   ?? e.end_endereco   ?? e.endereco   ?? '',
    cli_cep:        e.cli_cep        ?? e.end_cep        ?? e.cep        ?? '',
    cli_ativo:      e.cli_ativo      ?? e.ativo          ?? 'S'
  }

  out.logradouro = e.logradouro ?? e.end_logradouro ?? out.cli_logradouro
  out.numero     = e.numero     ?? e.end_numero     ?? out.cli_numero
  out.bairro     = e.bairro     ?? e.end_bairro     ?? out.cli_bairro
  out.endereco   = e.endereco   ?? e.end_endereco   ?? out.cli_endereco
  out.cep        = e.cep        ?? e.end_cep        ?? out.cli_cep
  out.ativo      = e.ativo      ?? out.cli_ativo
  return out
}
function formEnderecoToApi (f = {}) {
  const cli = {
    cli_logradouro: f.cli_logradouro,
    cli_numero:     f.cli_numero,
    cli_bairro:     f.cli_bairro,
    cli_endereco:   f.cli_endereco,
    cli_cep:        f.cli_cep,
    cli_ativo:      f.cli_ativo
  }
  const plain = {
    logradouro: f.cli_logradouro,
    numero:     f.cli_numero,
    bairro:     f.cli_bairro,
    endereco:   f.cli_endereco,
    cep:        f.cli_cep,
    ativo:      f.cli_ativo
  }

  return {
    id: f.id ?? null,
    cli_id: f.cli_id ?? null,
    cid_id: f.cid_id ?? null,
    uf_id:  f.uf_id  ?? null,
    ...cli,
    ...plain
  }
}

/* ORDEM: API ⇄ FORM */
function apiOrdemToForm (o = {}) {
  return {
    id: o.id ?? null,
    cli_id: o.cli_id ?? null,
    end_id: o.end_id ?? null,
    stt_id: o.stt_id ?? o.status_id ?? null,
    usu_id: o.usu_id ?? o.responsavel_id ?? null,
    observacao: o.observacao ?? o.descricao ?? '',
    data: o.data ?? null,
    hora: o.hora ?? null,
    cliente_nome: o.cliente_nome ?? '',
    status_nome:  o.status_nome ?? o.stt_nome ?? '',
    responsavel_nome: o.responsavel_nome ?? o.usu_nome ?? ''
  }
}
function formOrdemToApi (f = {}) {
  return {
    id: f.id ?? null,
    cli_id: f.cli_id,
    end_id: f.end_id,
    stt_id: f.stt_id,
    usu_id: f.usu_id,
    observacao: (f.observacao || '').trim(),
    data: f.data || null,
    hora: f.hora || null
  }
}

export default {
  name: 'OrdemFullPage',
  data () {
    return {
      $q: useQuasar(),

      // FORM MODELS
      clienteForm: { id: null, cnpj: '', nome: '', ddi: '', ddd: '', fone: '' },

      enderecoForm: {
        id: null, cli_id: null, cid_id: null, uf_id: null,
        cli_logradouro: '', cli_numero: '', cli_bairro: '',
        cli_endereco: '', cli_cep: '', cli_ativo: 'S'
      },

      ordemForm: { id: null, cli_id: null, end_id: null, stt_id: null, usu_id: null, observacao: '', data: null, dataBR: null, hora: null },

      // PAGAMENTOS
      pagamentoForm: {
        fpg_id: null,
        valor: null,
        parcela: 1,
        vencimento: null, // ISO para enviar
        vencimentoBR: null, // BR para o input
        pago: 'N'
      },
      pagamentos: {
        items: [],
        loading: false
      },

      // lookups/options
      clienteLookupOptions: [],
      endLookupOptions: [],
      cidadeLookupOptions: [],
      statusLookupOptions: [],
      ufOptions: [],
      formaPagOptions: [],
      responsavelLookupOptions: [],

      ui: {
        loading: {
          lookupCliente: false,
          lookupEndereco: false,
          lookupCidade: false,
          uf: false,
          status: false,
          responsavel: false,
          savingAll: false,
          savingEndereco: false
        },
        open: { cliente: true, endereco: true, ordem: true }
      },
      uiPag: {
        loading: {
          lookupForma: false,
          creatingLote: false,
          togglingPago: false,
          deleting: false
        },
        open: { pagamentos: false }
      },

      // tabela ordens
      table: { items: [], filter: '', pagination: { page: 1, rowsPerPage: 10 } },
      dense: true,

      // dialog
      dialog: { delete: { open: false, id: null } },

      // colunas ordens
      columns: [
        { name: '__actions', label: 'Ações', field: '__actions', sortable: false, align: 'left', headerStyle: 'min-width:100px; left:0; z-index:2;', style: 'min-width:100px;' },
        { name: 'id',               label: 'Código',        field: 'id', align: 'left' },
        { name: 'cliente_nome',     label: 'Cliente',       field: 'cliente_nome', align: 'left' },
        { name: 'endereco',         label: 'Endereço',      field: r => formatEnderecoLabel(r), align: 'left' },
        { name: 'status_nome',      label: 'Status',        field: 'status_nome', align: 'left' },
        { name: 'data',             label: 'Data',          field: r => isoToBR(r.data), align: 'left' },
        { name: 'hora',             label: 'Hora',          field: 'hora', align: 'left' },
        { name: 'responsavel_nome', label: 'Responsável',   field: 'responsavel_nome', align: 'left' }
      ],

      // colunas pagamentos
      pagColumns: [
        { name: '__actions', label: 'Ações', field: '__actions', sortable: false, align: 'left', headerStyle: 'min-width:90px; left:0; z-index:2;', style: 'min-width:90px;' },
        { name: 'id',         label: 'ID',          field: 'id', align: 'left' },
        { name: 'parcela',    label: 'Parcela',     field: 'parcela', align: 'left', format: v => `#${v}` },
        { name: 'forma',      label: 'Forma',       field: 'forma_pagamento_nome', align: 'left' },
        { name: 'valor',      label: 'Valor',       field: 'valor', align: 'right', format: v => `R$ ${Number(v||0).toFixed(2)}` },
        { name: 'vencimento', label: 'Vencimento',  field: 'vencimentoBR', align: 'left' },
        { name: 'pago',       label: 'Pago?',       field: 'pago', align: 'center', format: v => v === 'S' ? 'Sim' : 'Não' }
      ]
    }
  },
  computed: {
    clienteIdResolvido () { return !!this.clienteForm.id },
    enderecoIdResolvido () { return !!this.enderecoForm.id },
    canCreateCliente () { return (this.clienteForm.nome || '').trim().length > 0 },
    canCreateEndereco () { return this.clienteIdResolvido && (this.enderecoForm.cli_logradouro || '').trim().length > 0 },

    // pagamentos
    pagamentosTotal () {
      return (this.pagamentos.items || []).reduce((sum, p) => sum + Number(p.valor || 0), 0)
    },
    pagamentosPagoTotal () {
      return (this.pagamentos.items || []).reduce((sum, p) => sum + (p.pago === 'S' ? Number(p.valor || 0) : 0), 0)
    },
    pagamentosAbertoTotal () {
      return this.pagamentosTotal - this.pagamentosPagoTotal
    },
    canCreateLote () {
      const f = this.pagamentoForm
      return this.ordemForm?.id && f.fpg_id && Number(f.valor) > 0 && Number.isInteger(Number(f.parcela)) && Number(f.parcela) > 0 && f.vencimentoBR
    }
  },
  methods: {
    // regras
    req: v => (String(v ?? '').trim().length > 0) || 'Campo obrigatório',
    reqIfNewEndereco (v) { if (this.enderecoForm.id) return true; return (String(v ?? '').trim().length > 0) || 'Campo obrigatório' },

    // Lookups
    async filterCliente (val, update, abort) {
      this.ui.loading.lookupCliente = true
      try {
        const { items } = await Cliente.getAll({ q: val })
        update(() => {
          this.clienteLookupOptions = (items || []).map(c => ({ label: `${c.id} – ${c.nome}`, value: c.id, raw: c }))
        })
      } catch (e) { console.error(e); abort() } finally { this.ui.loading.lookupCliente = false }
    },
    async onPickCliente (id) {
      if (!id) return
      try {
        const { item } = await Cliente.getById(id)
        this.clienteForm = {
          id: item.id,
          cnpj: item.cnpj ?? '',
          nome: item.nome ?? '',
          ddi: item.ddi ?? '',
          ddd: item.ddd ?? '',
          fone: item.fone ?? ''
        }
        this.clearEndereco({ keepUfCityLists: true })
        this.endLookupOptions = []

        this.enderecoForm.cli_id = this.clienteForm.id
        this.ordemForm.cli_id = this.clienteForm.id
      } catch { this.$q.notify({ type: 'negative', message: 'Falha ao carregar cliente', position: 'top-right' }) }
    },

    async filterEndereco (term, update, abort) {
      if (!this.clienteIdResolvido) {
        update(() => { this.endLookupOptions = [] })
        return
      }
      this.ui.loading.lookupEndereco = true
      try {
        const { items } = await Endereco.getAll({ q: term, cli_id: this.clienteForm.id })
        const filtered = (items || []).filter(e => e.cli_id == null || e.cli_id === this.clienteForm.id)
        update(() => {
          this.endLookupOptions = filtered.map(e => {
            const f = apiEnderecoToForm(e)
            return { label: formatEnderecoLabel(f), value: f.id, raw: f }
          })
        })
      } catch (e) {
        console.error(e)
        abort()
      } finally {
        this.ui.loading.lookupEndereco = false
      }
    },

    async onPickEndereco (id) {
      if (!id) return
      try {
        const { item } = await Endereco.getById(id)
        if ((item?.cli_id ?? item?.cliente_id) !== this.clienteForm.id) {
          this.enderecoForm.id = null
          this.$q.notify({ type: 'warning', message: 'Endereço não pertence ao cliente selecionado.', position: 'top-right' })
          return
        }
        this.enderecoForm = apiEnderecoToForm(item)

        if (!this.enderecoForm.uf_id && this.enderecoForm.cid_id) {
          try {
            const { item: cid } = await Cidade.getById(this.enderecoForm.cid_id)
            this.enderecoForm.uf_id = cid?.uf_id ?? cid?.uf?.id ?? this.enderecoForm.uf_id
          } catch {}
        }
        this.ordemForm.end_id = this.enderecoForm.id
      } catch {
        this.$q.notify({ type: 'negative', message: 'Falha ao carregar endereço', position: 'top-right' })
      }
    },

    async filterCidade (val, update, abort) {
      this.ui.loading.lookupCidade = true
      try {
        const { items } = await Cidade.getAll({ q: val, uf_id: this.enderecoForm.uf_id })
        update(() => {
          this.cidadeLookupOptions = (items || []).map(c => ({ label: `${c.uf_sigla ?? ''} — ${c.nome}`, value: c.id, raw: c }))
        })
      } catch (e) { console.error(e); abort() } finally { this.ui.loading.lookupCidade = false }
    },

    async filterStatus (val, update, abort) {
      this.ui.loading.status = true
      try {
        const { items } = await Status.getAll({ q: val })
        update(() => {
          this.statusLookupOptions = (items || []).map(s => ({ label: s.nome, value: s.id, raw: s }))
        })
      } catch (e) { console.error(e); abort() } finally { this.ui.loading.status = false }
    },
    onPickStatus () { /* noop */ },

    async filterResponsavel (val, update, abort) {
      this.ui.loading.responsavel = true
      try {
        const { items } = await Responsavel.getAll()
        const list = (items || [])
          .filter(r => !val || String(r.nome).toLowerCase().includes(String(val).toLowerCase()))
          .map(r => ({ label: `${r.id} — ${r.nome}`, value: r.id, raw: r }))
        update(() => { this.responsavelLookupOptions = list })
      } catch (e) {
        console.error(e); abort()
      } finally {
        this.ui.loading.responsavel = false
      }
    },

    async loadResponsaveisOptionsInit () {
      try {
        const { items } = await Responsavel.getAll()
        this.responsavelLookupOptions = (items || []).map(r => ({ label: `${r.id} — ${r.nome}`, value: r.id }))
      } catch {}
    },

    // Forma de pagamento
    async filterFormaPag (val, update, abort) {
      this.uiPag.loading.lookupForma = true
      try {
        const { items } = await FormaPag.getAll()
        const list = (items || [])
          .filter(i => !val || String(i.nome).toLowerCase().includes(String(val).toLowerCase()))
          .map(i => ({ label: i.nome, value: i.id, raw: i }))
        update(() => { this.formaPagOptions = list })
      } catch (e) { console.error(e); abort() } finally { this.uiPag.loading.lookupForma = false }
    },
    async loadFormaPagOptionsInit () {
      try {
        const { items } = await FormaPag.getAll()
        this.formaPagOptions = (items || []).map(i => ({ label: i.nome, value: i.id, raw: i }))
      } catch {}
    },

    // Saves Cliente/Endereco/OS
    async saveClienteInline () {
      try {
        const payload = { ...this.clienteForm }
        trimStrings(payload)
        if (payload.id) {
          await Cliente.update(payload)
          this.$q.notify({ type: 'positive', message: 'Cliente atualizado!', position: 'top-right' })
        } else {
          const r = await Cliente.create(payload)
          const id = r?.item?.id ?? r?.id
          if (id) this.clienteForm.id = id
          this.$q.notify({ type: 'positive', message: 'Cliente criado!', position: 'top-right' })
          this.enderecoForm.cli_id = this.clienteForm.id
          this.ordemForm.cli_id = this.clienteForm.id
        }
      } catch { this.$q.notify({ type: 'negative', message: 'Erro ao salvar cliente', position: 'top-right' }) }
    },

    async saveEnderecoInline () {
      if (!this.clienteIdResolvido) {
        this.$q.notify({ type: 'warning', message: 'Selecione/salve um cliente primeiro.', position: 'top-right' })
        return
      }
      this.ui.loading.savingEndereco = true
      try {
        this.enderecoForm.cli_id = this.clienteForm.id
        const body = formEnderecoToApi({ ...this.enderecoForm })
        trimStrings(body)

        if (body.id) {
          await Endereco.update({ id: body.id, ...body })
          this.$q.notify({ type: 'positive', message: 'Endereço atualizado!', position: 'top-right' })
        } else {
          const r = await Endereco.create(body)
          const salvo = r?.item ?? r
          this.enderecoForm = apiEnderecoToForm({ ...salvo, cli_id: this.clienteForm.id })
          this.$q.notify({ type: 'positive', message: 'Endereço criado!', position: 'top-right' })
        }
        this.ordemForm.end_id = this.enderecoForm.id
      } catch (e) {
        console.error(e)
        this.$q.notify({ type: 'negative', message: 'Erro ao salvar endereço', position: 'top-right' })
      } finally {
        this.ui.loading.savingEndereco = false
      }
    },

    async saveAll () {
      this.ui.loading.savingAll = true
      try {
        if (!this.clienteIdResolvido) {
          if (!this.canCreateCliente) {
            this.$q.notify({ type: 'warning', message: 'Informe o cliente.', position: 'top-right' })
            this.ui.open.cliente = true
            this.ui.loading.savingAll = false
            return
          }
          await this.saveClienteInline()
          if (!this.clienteIdResolvido) throw new Error('Falha ao resolver cliente')
        }

        if (this.canCreateEndereco) {
          await this.saveEnderecoInline()
        }

        if (!this.enderecoIdResolvido) {
          this.$q.notify({ type: 'warning', message: 'Selecione ou cadastre um endereço.', position: 'top-right' })
          this.ui.open.endereco = true
          this.ui.loading.savingAll = false
          return
        }

        this.ordemForm.cli_id = this.clienteForm.id
        this.ordemForm.end_id = this.enderecoForm.id

        // BR -> ISO antes de enviar
        const body = formOrdemToApi({ ...this.ordemForm })
        body.data = brToISO(this.ordemForm.dataBR)
        trimStrings(body)

        if (body.id) {
          await Ordem.update(body)
          this.$q.notify({ type: 'positive', message: 'OS atualizada!', position: 'top-right' })
        } else {
          const r = await Ordem.create(body)
          const newId = r?.item?.id ?? r?.id
          if (newId) this.ordemForm.id = newId
          // mantém os dois campos após create
          this.ordemForm.data = body.data
          this.ordemForm.dataBR = isoToBR(body.data)
          this.$q.notify({ type: 'positive', message: 'OS criada!', position: 'top-right' })
        }

        await this.fetchOrdens()
        this.clearAll()
      } catch (e) {
        console.error(e)
        this.$q.notify({ type: 'negative', message: 'Erro ao salvar tudo', position: 'top-right' })
      } finally { this.ui.loading.savingAll = false }
    },

    // Tabela (ordens)
    async fetchOrdens () {
      try {
        const { items } = await Ordem.getAll()
        this.table.items = (items || []).map(o => {
          const f = apiOrdemToForm(o)
          return {
            ...o,
            ...f,
            end_label: formatEnderecoLabel(apiEnderecoToForm({
              id: o.end_id,
              end_logradouro: o.end_logradouro,
              end_numero: o.end_numero,
              end_bairro: o.end_bairro
            }))
          }
        })
        this.$nextTick(this.updateHeaderOffset)
      } catch {
        this.$q.notify({ type: 'negative', message: 'Erro ao carregar ordens', position: 'top-right' })
      }
    },

    async loadOrderIntoForm (row) {
      try {
        const { item } = await Ordem.getById(row.id)

        // CLIENTE
        this.clienteForm = { id: item.cli_id ?? null, cnpj: '', nome: '', ddi: '', ddd: '', fone: '' }
        if (this.clienteForm.id) {
          try {
            const { item: c } = await Cliente.getById(this.clienteForm.id)
            this.clienteForm.cnpj = c?.cnpj ?? ''
            this.clienteForm.nome = c?.nome ?? ''
            this.clienteForm.ddi  = c?.ddi  ?? ''
            this.clienteForm.ddd  = c?.ddd  ?? ''
            this.clienteForm.fone = c?.fone ?? ''
          } catch {}
        }

        // ENDEREÇO
        if (item.end_id) {
          let end = null
          try { end = await Endereco.getById(item.end_id).then(r => r.item) } catch {}
          this.enderecoForm = end
            ? apiEnderecoToForm(end)
            : apiEnderecoToForm({
                id: item.end_id,
                cli_id: item.cli_id,
                end_logradouro: item.end_logradouro,
                end_numero: item.end_numero,
                end_bairro: item.end_bairro,
                end_cep: item.end_cep,
                cidade_id: item.cid_id
              })
          if (!this.enderecoForm.uf_id && this.enderecoForm.cid_id) {
            try {
              const { item: cid } = await Cidade.getById(this.enderecoForm.cid_id)
              this.enderecoForm.uf_id = cid?.uf_id ?? cid?.uf?.id ?? this.enderecoForm.uf_id
            } catch {}
          }
        } else {
          this.clearEndereco({ keepUfCityLists: true })
          this.enderecoForm.cli_id = this.clienteForm.id
        }

        // ORDEM
        this.ordemForm = apiOrdemToForm(item)
        // ISO -> BR para o input
        this.ordemForm.dataBR = isoToBR(this.ordemForm.data)

        // lookups
        await this.ensureLookupCacheForCurrent()
        await this.loadFormaPagOptionsInit()

        // PAGAMENTOS da OS
        await this.fetchPagamentos()
        this.uiPag.open.pagamentos = true

        this.$q.notify({ type: 'info', message: 'OS carregada no formulário.', position: 'top-right' })
      } catch {
        this.$q.notify({ type: 'negative', message: 'Erro ao carregar OS', position: 'top-right' })
      }
    },

    async ensureLookupCacheForCurrent () {
      if (this.clienteForm.id && !this.clienteLookupOptions.find(o => o.value === this.clienteForm.id)) {
        this.clienteLookupOptions = [...this.clienteLookupOptions, { label: `${this.clienteForm.id} – ${this.clienteForm.nome}`, value: this.clienteForm.id }]
      }
      if (this.enderecoForm.id && !this.endLookupOptions.find(o => o.value === this.enderecoForm.id)) {
        this.endLookupOptions = [...this.endLookupOptions, { label: formatEnderecoLabel(this.enderecoForm), value: this.enderecoForm.id }]
      }
      if (this.enderecoForm.cid_id && !this.cidadeLookupOptions.find(o => o.value === this.enderecoForm.cid_id)) {
        const cid = await Cidade.getById(this.enderecoForm.cid_id).then(r => r.item).catch(() => null)
        if (cid) this.cidadeLookupOptions = [...this.cidadeLookupOptions, { label: `${cid.uf_sigla ?? ''} — ${cid.nome}`, value: cid.id }]
      }
      if (this.ordemForm.stt_id && !this.statusLookupOptions.find(o => o.value === this.ordemForm.stt_id)) {
        const s = await Status.getById(this.ordemForm.stt_id).then(r => r.item).catch(() => null)
        if (s) this.statusLookupOptions = [...this.statusLookupOptions, { label: s.nome, value: s.id }]
      }

      if (!this.enderecoForm.uf_id && this.enderecoForm.cid_id) {
        try {
          const { item: cid } = await Cidade.getById(this.enderecoForm.cid_id)
          this.enderecoForm.uf_id = cid?.uf_id ?? cid?.uf?.id ?? this.enderecoForm.uf_id
        } catch {}
      }

      if (this.ordemForm.usu_id && !this.responsavelLookupOptions.find(o => o.value === this.ordemForm.usu_id)) {
        try {
          const r = await Responsavel.getResponsavel(this.ordemForm.usu_id).then(x => x.item)
          if (r) this.responsavelLookupOptions = [
            ...this.responsavelLookupOptions,
            { label: `${r.id} — ${r.nome}`, value: r.id }
          ]
        } catch {}
      }
    },

    // Pagamentos (OS)
    async fetchPagamentos () {
      if (!this.ordemForm.id) { this.pagamentos.items = []; return }
      this.pagamentos.loading = true
      try {
        const { items } = await OrdemPag.getAll()
        // ISO -> BR para exibição
        this.pagamentos.items = (items || [])
          .filter(p => p.ord_id === this.ordemForm.id)
          .map(p => ({ ...p, vencimentoBR: isoToBR(p.vencimento) }))
      } catch (e) {
        console.error(e)
        this.$q.notify({ type: 'negative', message: 'Erro ao carregar pagamentos', position: 'top-right' })
      } finally {
        this.pagamentos.loading = false
      }
    },

    async createLotePagamentos () {
      if (!this.canCreateLote) return
      this.uiPag.loading.creatingLote = true
      try {
        const payload = {
          ord_id: this.ordemForm.id,
          fpg_id: this.pagamentoForm.fpg_id,
          valor: Number(this.pagamentoForm.valor),
          parcela: Number(this.pagamentoForm.parcela),
          vencimento: brToISO(this.pagamentoForm.vencimentoBR),
          pago: this.pagamentoForm.pago
        }
        const r = await OrdemPag.create(payload)
        if (r?.ids?.length) {
          this.$q.notify({ type: 'positive', message: `Gerado ${r.ids.length} parcela(s).`, position: 'top-right' })
        } else {
          this.$q.notify({ type: 'positive', message: 'Pagamentos gerados!', position: 'top-right' })
        }
        await this.fetchPagamentos()
        this.clearPagamentoForm()
      } catch (e) {
        console.error(e)
        this.$q.notify({ type: 'negative', message: 'Erro ao gerar parcelas ' + (e?.response?.status || '') + ' ' + (e?.response?.data || ''), position: 'top-right' })
      } finally {
        this.uiPag.loading.creatingLote = false
      }
    },

    async togglePago (row) {
      if (!row?.id) return
      this.uiPag.loading.togglingPago = true
      try {
        const novo = row.pago === 'S' ? 'N' : 'S'
        await OrdemPag.update({ id: row.id, pago: novo })
        row.pago = novo
        this.$q.notify({ type: 'positive', message: novo === 'S' ? 'Parcela marcada como paga' : 'Pagamento estornado', position: 'top-right' })
      } catch (e) {
        console.error(e)
        this.$q.notify({ type: 'negative', message: 'Falha ao atualizar status de pagamento', position: 'top-right' })
      } finally {
        this.uiPag.loading.togglingPago = false
      }
    },

    async deleteParcela (row) {
      if (!row?.id) return
      this.uiPag.loading.deleting = true
      try {
        await OrdemPag.delete(row.id)
        this.pagamentos.items = this.pagamentos.items.filter(p => p.id !== row.id)
        this.$q.notify({ type: 'positive', message: 'Parcela excluída', position: 'top-right' })
      } catch (e) {
        console.error(e)
        this.$q.notify({ type: 'negative', message: 'Falha ao excluir parcela', position: 'top-right' })
      } finally {
        this.uiPag.loading.deleting = false
      }
    },

    clearPagamentoForm () {
      this.pagamentoForm = { fpg_id: null, valor: null, parcela: 1, vencimento: null, vencimentoBR: null, pago: 'N' }
    },

    // excluir OS
    confirmDelete (id) { this.dialog.delete = { open: true, id } },
    async deleteOrdem (id) {
      try { await Ordem.delete(id); this.$q.notify({ type: 'positive', message: 'OS excluída!', position: 'top-right' }); await this.fetchOrdens() }
      catch { this.$q.notify({ type: 'negative', message: 'Erro ao excluir OS', position: 'top-right' }) }
    },

    // limpar
    clearCliente () { this.clienteForm = { id: null, cnpj: '', nome: '', ddi: '', ddd: '', fone: '' } },
    clearEndereco ({ keepUfCityLists = false } = {}) {
      this.enderecoForm = { id: null, cli_id: this.clienteForm.id ?? null, cid_id: null, uf_id: null, cli_logradouro: '', cli_numero: '', cli_bairro: '', cli_endereco: '', cli_cep: '', cli_ativo: 'S' }
      if (!keepUfCityLists) this.cidadeLookupOptions = []
    },
    clearOS () { this.ordemForm = { id: null, cli_id: this.clienteForm.id ?? null, end_id: null, stt_id: null, observacao: '', data: null, dataBR: null, hora: null } },
    clearAll () { this.clearOS(); this.clearEndereco(); this.clearCliente(); this.clearPagamentoForm(); this.pagamentos.items = [] },

    updateHeaderOffset () {
      this.$nextTick(() => {
        const topEl = this.$el.querySelector('.q-table__top')
        const h = topEl ? topEl.offsetHeight : 0
        this.$refs.tableScroll?.style?.setProperty('--table-top-h', h + 'px')
      })
    },

    // cargas iniciais
    async loadUfs () {
      this.ui.loading.uf = true
      try {
        const { items } = await Uf.getAll()
        this.ufOptions = (items || []).map(u => ({ id: u.id, sigla: u.sigla, nome: u.nome }))
      } finally { this.ui.loading.uf = false }
    },

    async handleDeepLink () {
    const { params = {}, query = {} } = this.$route || {}
    // aceita tanto params quanto query
    const ordId   = query.ord_id ?? query.id ?? params.ord_id ?? params.id ?? null
    const cliId   = query.cli_id ?? params.cli_id ?? null
    const endId   = query.end_id ?? params.end_id ?? null
    const dataISO = query.data   ?? null       // YYYY-MM-DD
    const hora    = query.hora   ?? null       // HH:mm

    // 1) Se veio ord_id -> carrega OS completa
    if (ordId) {
      await this.loadOrderIntoForm({ id: Number(ordId) })
      return
    }

    // 2) Pré-preenche cliente/endereço se vieram
    if (cliId) {
      try {
        const { item: c } = await Cliente.getById(cliId)
        if (c?.id) {
          this.clienteForm.id  = c.id
          this.clienteForm.nome = c.nome ?? ''
          this.enderecoForm.cli_id = c.id
          this.ordemForm.cli_id    = c.id
        }
      } catch {}
    }

    if (endId) {
      try {
        const { item: e } = await Endereco.getById(endId)
        if (e?.id) {
          this.enderecoForm = apiEnderecoToForm(e)
          this.ordemForm.end_id = this.enderecoForm.id
          // garantir UF via cidade
          if (!this.enderecoForm.uf_id && this.enderecoForm.cid_id) {
            try {
              const { item: cid } = await Cidade.getById(this.enderecoForm.cid_id)
              this.enderecoForm.uf_id = cid?.uf_id ?? cid?.uf?.id ?? this.enderecoForm.uf_id
            } catch {}
          }
        }
      } catch {}
    }

    // 3) Pré-preenche data/hora de criação
    if (dataISO) {
      // converte ISO (YYYY-MM-DD) para BR (DD/MM/YYYY) pro input
      this.ordemForm.data   = dataISO
      this.ordemForm.dataBR = isoToBR(dataISO)
    }
    if (hora) {
      this.ordemForm.hora = hora.length === 5 ? hora + ':00' : hora // aceita HH:mm
    }
  },

  async onRouteChange () {
    await this.handleDeepLink()
  }
  },
  async mounted () {
    await Promise.all([this.fetchOrdens(), 
                       this.loadUfs(), 
                       this.loadFormaPagOptionsInit(), 
                       this.loadResponsaveisOptionsInit()])
    this.updateHeaderOffset()
    window.addEventListener('resize', this.updateHeaderOffset)
    await this.handleDeepLink()
    this.$watch(() => this.$route.fullPath, () => this.onRouteChange(), { immediate: false })
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.updateHeaderOffset)
  }
}

// helpers
function trimStrings (obj) { Object.keys(obj || {}).forEach(k => { if (typeof obj[k] === 'string') obj[k] = obj[k].trim() }) }
function formatEnderecoLabel (e = {}) {
  const id  = e.id ?? e.end_id ?? ''
  const log = e.logradouro ?? e.end_logradouro ?? e.cli_logradouro ?? ''
  const num = e.numero     ?? e.end_numero     ?? e.cli_numero     ?? ''
  const bai = e.bairro     ?? e.end_bairro     ?? e.cli_bairro     ?? ''
  return `${id} – ${log}${num ? ', ' + num : ''}${bai ? ' - ' + bai : ''}`.trim()
}
</script>

<style scoped>
.page-grid{
  display:grid;
  grid-template-columns: minmax(520px, 1.6fr) minmax(360px, 0.9fr);
  gap:12px;
  height:100%;
  overflow:hidden;
}
.form-col{ min-width:0; }
.form-card{ height:100%; display:flex; flex-direction:column; overflow:hidden; }
.form-body{ flex:1 1 auto; min-height:0; overflow:auto; }

.table-col{ min-width:0; display:flex; flex-direction:column; }
.table-card{ flex:1 1 auto; display:flex; min-height:0; border-radius:14px; overflow:hidden; }
.table-scroll{ flex:1 1 auto; min-height:0; overflow:auto; }

.table-scroll :deep(.q-table__top){
  position: sticky;
  top: 0;
  z-index: 4;
  background: var(--q-table-bg, #fff);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  padding: 8px;
}

.table-header th{
  position: sticky;
  top: var(--table-top-h, 0px);
  z-index: 3;
  background: var(--q-table-bg,#fff);
  backdrop-filter: saturate(180%) blur(2px);
}

.sticky-left{ position: sticky; left:0; z-index:2; background:#fff; box-shadow:1px 0 0 rgba(0,0,0,0.06); }
.action-td{ display:flex; align-items:center; gap:4px; min-width:84px; }

.q-table th, .q-table td { white-space:nowrap; text-align:left; }
</style>
