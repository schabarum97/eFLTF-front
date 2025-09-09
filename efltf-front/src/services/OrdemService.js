import { Ordem as OrdemOriginal } from './ordem.js'

export const Ordem = {
  getAll: () => OrdemOriginal.getOrdensAll(), 
  getById: (id) => OrdemOriginal.getOrdem(id),
  create: (data) => OrdemOriginal.createOrdem(data),
  update: (data) => OrdemOriginal.updateOrdem({ id: data.ord_id, ...data }), 
  delete: (id) => OrdemOriginal.deleteOrdem(id) 
}
