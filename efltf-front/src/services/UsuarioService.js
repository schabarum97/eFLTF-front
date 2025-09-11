import { api } from '../boot/axios'

export const Usuario = {
  async getUsuario (id) {
    try {
      const ret = await api.get(`/usuario/${id}`)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async getUsuariosAll () {
    try {
      const ret = await api.get('/usuario')
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async createUsuario (data) {
    try {
      const ret = await api.post('/usuario', data)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async updateUsuario (data) {
    try {
      const { id, ...body } = data
      const ret = await api.patch(`/usuario/${id}`, body)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async deleteUsuario (id) {
    try {
      const ret = await api.delete(`/usuario/${id}`)
      return ret.data
    } catch (err) {
      throw err
    }
  }
}
