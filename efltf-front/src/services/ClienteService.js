import { Cliente as ClienteOriginal } from './cliente.js'

export const Cliente = {
  getAll: () => ClienteOriginal.getClientesAll(),
  getById: (id) => ClienteOriginal.getCliente(id), 
  create: (data) => ClienteOriginal.createCliente(data), 
  update: (data) => ClienteOriginal.updateCliente({ id: data.cli_id, ...data }),
  delete: (id) => ClienteOriginal.deleteCliente(id) 
}
