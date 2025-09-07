import { Endereco as EnderecoOriginal } from './endereco.js'

export const Endereco = {
  getAll: () => EnderecoOriginal.getEnderecosAll(),                   // listagem
  getById: (id) => EnderecoOriginal.getEndereco(id),                  // busca por ID
  create: (data) => EnderecoOriginal.createEndereco(data),            // criação
  update: (data) => EnderecoOriginal.updateEndereco({ id: data.id, ...data }), // atualização (usa id)
  delete: (id) => EnderecoOriginal.deleteEndereco(id)                 // exclusão
}
