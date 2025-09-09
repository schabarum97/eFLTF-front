import { OrdemPag as OrdemPagOriginal } from './ordempag.js'

export const OrdemPag = {
  getAll: () => OrdemPagOriginal.getOrdPagsAll(),
  getById: (id) => OrdemPagOriginal.getOrdPag(id),
  create: (data) => OrdemPagOriginal.createOrdPag(data),
  update: (data) => OrdemPagOriginal.updateOrdPag({ id: data.id, ...data }), 
  delete: (id) => OrdemPagOriginal.deleteOrdPag(id) 
}
