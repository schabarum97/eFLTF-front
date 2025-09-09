import { Endereco as EnderecoOriginal } from './endereco.js'

export const Endereco = {
  getAll: () => EnderecoOriginal.getEnderecosAll(), 
  getById: (id) => EnderecoOriginal.getEndereco(id), 
  create: (data) => EnderecoOriginal.createEndereco(data), 
  update: (data) => EnderecoOriginal.updateEndereco({ id: data.id, ...data }), 
  delete: (id) => EnderecoOriginal.deleteEndereco(id)
}
