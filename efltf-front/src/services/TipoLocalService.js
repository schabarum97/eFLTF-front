import { TipoLocal as TipoLocalOriginal } from './tipolocal.js'

export const TipoLocal = {
  getAll: () => TipoLocalOriginal.getTiposLocalAll(), 
  getById: (id) => TipoLocalOriginal.getTipoLocal(id), 
  create: (data) => TipoLocalOriginal.createTipoLocal(data), 
  update: (data) => TipoLocalOriginal.updateTipoLocal({ id: data.id, ...data }),
  delete: (id) => TipoLocalOriginal.deleteTipoLocal(id)
}
