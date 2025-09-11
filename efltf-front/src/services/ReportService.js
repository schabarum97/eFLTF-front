import { api } from '../boot/axios'

export const Report = {
  async getReport (id) {
    try {
      const resp = await api.get(`/report/os/${id}`)
      return resp.data
    } catch (err) {
      throw err
    }
  }
}