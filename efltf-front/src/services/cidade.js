import { api } from '../boot/axios'

export const Cidade = {
  async getCidade(id) {
    try {
      const cidade = await api.get(`/cidade/id/${id}`)
      return cidade.data
    } catch (err) {
      throw err
    }
  },

  async getCidadesAll() {
    try {
      const cidades = await api.get('/cidade')
      return cidades.data
    } catch (err) {
      throw err
    }
  },

  async createCidade(data) {
    try {
      const ret = await api.post('/cidade', data)
      console.log(ret.data)
      return ret.data
    } catch (err) {
      throw err
    }
  },

  async updateCidade(data) {
    try {
      return await api.patch(`/cidade/${data.id}`, data)
    } catch (err) {
      throw err
    }
  },

  async deleteCidade(id) {
    try {
      return await api.delete(`/cidade/${id}`)
    } catch (err) {
      throw err
    }
  }
}
