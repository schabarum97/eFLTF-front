import { Status as StatusOriginal } from './status.js'

export const Status = {
  getAll: () => StatusOriginal.getStatusAll(), 
  getById: (id) => StatusOriginal.getStatus(id), 
  create: (data) => StatusOriginal.createStatus(data),
  update: (data) => StatusOriginal.updateStatus({ id: data.stt_id, ...data }), 
  delete: (id) => StatusOriginal.deleteStatus(id) 
}
