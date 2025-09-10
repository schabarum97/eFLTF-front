import { api } from '../boot/axios'

export const Agendamento = {
  async getDisponibilidades ({ de, ate }) {
    try {
      const resp = await api.get('/agendamento/disponibilidade', {
        params: { de, ate }
      })
      return resp.data
    } catch (err) {
      throw err
    }
  }
}