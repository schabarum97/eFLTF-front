import { Cliente as ClienteOriginal } from './cliente.js'

export const Cliente = {
  getAll: () => ClienteOriginal.getClientesAll(),                   // listagem
  getById: (id) => ClienteOriginal.getCliente(id),          // busca por ID
  create: (data) => ClienteOriginal.createCliente(data),          // criação
  update: (data) => ClienteOriginal.updateCliente({ id: data.cli_id, ...data }), // atualização
  delete: (id) => ClienteOriginal.deleteCliente(id)             // exclusão
}
