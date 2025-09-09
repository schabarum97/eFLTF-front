import { Uf as UfOriginal } from './uf.js'

export const Uf = {
  getAll: () => UfOriginal.getUfs(), 
  getById: (id) => UfOriginal.getUf(id),
  create: (data) => UfOriginal.createUf(data), 
  update: (data) => UfOriginal.updateUf({ id: data.uf_id, ...data }), 
  delete: (id) => UfOriginal.deleteUf(id) 
}
