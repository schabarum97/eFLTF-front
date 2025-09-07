// src/services/StatusService.js
import { api } from '../boot/axios'

export const Status = {
  async getStatus(id) {
    try {
      const status = await api.get(`/status/id/${id}`)
      return status.data
    } catch (err) {
      throw err
    }
  },

  async getStatusAll() {
    try {
      const statuses = await api.get('/status')
      console.log(statuses.data) // DEBUG
      return statuses.data
    } catch (err) {
      throw err
    }
  },

  async createStatus(data) {
    try {
      const ret = await api.post('/status', data)
      console.log(ret.data)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async updateStatus(data) {
    try {
      return await api.patch(`/status/${data.id}`, data)
    } catch (err) {
      throw err
    }
  },

  async deleteStatus(id) {
    try {
      return await api.delete(`/status/${id}`)
    } catch (err) {
      throw err
    }
  }
}
