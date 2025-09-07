import { Status as StatusOriginal } from './status.js'

export const Status = {
  getAll: () => StatusOriginal.getStatusAll(),                   // listagem
  getById: (id) => StatusOriginal.getStatus(id),          // busca por ID
  create: (data) => StatusOriginal.createStatus(data),          // criação
  update: (data) => StatusOriginal.updateStatus({ id: data.stt_id, ...data }), // atualização
  delete: (id) => StatusOriginal.deleteStatus(id)             // exclusão
}
