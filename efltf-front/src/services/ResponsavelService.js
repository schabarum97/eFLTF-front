import { Responsavel as ResponsavelOriginal } from './responsavel.js'

export const Responsavel = {
  getAll: () => ResponsavelOriginal.getResponsaveisAll(), 
  getById: (id) => ResponsavelOriginal.getResponsavel(id), 
  create: (data) => ResponsavelOriginal.createResponsavel(data), 
  update: (data) => ResponsavelOriginal.updateResponsavel({ id: data.id, ...data }),
  delete: (id) => ResponsavelOriginal.deleteResponsavel(id)
}
