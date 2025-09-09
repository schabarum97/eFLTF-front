// src/services/DashService.js
import { api } from '../boot/axios'

export const Dash = {
  async getResumo() {
    try {
      const ret = await api.get('/dash/resumo')
      return ret.data
    } catch (err) {
      throw err
    }
  },

  // OS por responsável
  async getPorResponsavel() {
    try {
      const ret = await api.get('/dash/por-responsavel')
      return ret.data
    } catch (err) {
      throw err
    }
  },

  // Backlog por idade (0-2, 3-7, 8-14, >14)
  async getBacklogAging() {
    try {
      const ret = await api.get('/dash/backlog-aging')
      return ret.data
    } catch (err) {
      throw err
    }
  },

  // Lista de OS de hoje + amanhã
  async getHojeEAmanha() {
    try {
      const ret = await api.get('/dash/hoje-amanha')
      return ret.data
    } catch (err) {
      throw err
    }
  },

  // carga por dia (0..6) e hora
  async getCargaDiaHora() {
    try {
      const ret = await api.get('/dash/carga-dia-hora')
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async getPagamentosRecentes() {
    try {
      const ret = await api.get('/dash/pagamentos-recentes')
      return ret.data 
    } catch (err) {
      throw err
    }
  }
}
