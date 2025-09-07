// src/services/ClienteService.js
import { api } from '../boot/axios'

export const Cliente = {
  async getCliente(id) {
    try {
      const cliente = await api.get(`/cliente/id/${id}`)
      return cliente.data
    } catch (err) {
      throw err
    }
  },

  async getClientesAll() {
    try {
      const clientes = await api.get('/cliente')
      console.log(clientes.data) // DEBUG
      return clientes.data
    } catch (err) {
      throw err
    }
  },

  async createCliente(data) {
    try {
      const ret = await api.post('/cliente', data)
      console.log(ret.data)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async updateCliente(data) {
    try {
      return await api.patch(`/cliente/${data.id}`, data)
    } catch (err) {
      throw err
    }
  },

  async deleteCliente(id) {
    try {
      return await api.delete(`/cliente/${id}`)
    } catch (err) {
      throw err
    }
  }
}
