import { Ordem as OrdemOriginal } from './ordem.js'

export const Ordem = {
  getAll: () => OrdemOriginal.getOrdensAll(),                   // listagem
  getById: (id) => OrdemOriginal.getOrdem(id),          // busca por ID
  create: (data) => OrdemOriginal.createOrdem(data),          // criação
  update: (data) => OrdemOriginal.updateOrdem({ id: data.ord_id, ...data }), // atualização
  delete: (id) => OrdemOriginal.deleteOrdem(id)             // exclusão
}
