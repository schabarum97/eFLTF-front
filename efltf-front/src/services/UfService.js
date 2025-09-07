import { Uf as UfOriginal } from './uf.js'

export const Uf = {
  getAll: () => UfOriginal.getUfs(),                   // listagem
  getById: (id) => UfOriginal.getUf(id),          // busca por ID
  create: (data) => UfOriginal.createUf(data),          // criação
  update: (data) => UfOriginal.updateUf({ id: data.uf_id, ...data }), // atualização
  delete: (id) => UfOriginal.deleteUf(id)             // exclusão
}
