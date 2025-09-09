import { Cidade as CidadeOriginal } from './cidade.js'

export const Cidade = {
  getAll: () => CidadeOriginal.getCidadesAll(), 
  getById: (id) => CidadeOriginal.getCidade(id), 
  create: (data) => CidadeOriginal.createCidade(data), 
  update: (data) => CidadeOriginal.updateCidade({ id: data.cid_id, ...data }),
  delete: (id) => CidadeOriginal.deleteCidade(id)
}
