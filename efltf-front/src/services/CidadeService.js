import { Cidade as CidadeOriginal } from './cidade.js'

export const Cidade = {
  getAll: () => CidadeOriginal.getCidadesAll(),                   // listagem
  getById: (id) => CidadeOriginal.getCidade(id),          // busca por ID
  create: (data) => CidadeOriginal.createCidade(data),          // criação
  update: (data) => CidadeOriginal.updateCidade({ id: data.cid_id, ...data }), // atualização
  delete: (id) => CidadeOriginal.deleteCidade(id)             // exclusão
}
