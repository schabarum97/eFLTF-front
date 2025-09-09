import { FormaPag as FormaPagOriginal } from './formapag.js'

export const FormaPag = {
  getAll: () => FormaPagOriginal.getFormasPagAll(), 
  getById: (id) => FormaPagOriginal.getFormaPag(id),
  create: (data) => FormaPagOriginal.createFormaPag(data), 
  update: (data) => FormaPagOriginal.updateFormaPag({ id: data.id, ...data }),
  delete: (id) => FormaPagOriginal.deleteFormaPag(id) 
}
