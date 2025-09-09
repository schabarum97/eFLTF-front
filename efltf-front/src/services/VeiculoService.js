import { Veiculo as VeiculoOriginal } from './veiculo.js'

export const Veiculo = {
  getAll: () => VeiculoOriginal.getVeiculosAll(), 
  getById: (id) => VeiculoOriginal.getVeiculo(id),
  create: (data) => VeiculoOriginal.createVeiculo(data),
  update: (data) => VeiculoOriginal.updateVeiculo({ id: data.ord_id, ...data }), 
  delete: (id) => VeiculoOriginal.deleteVeiculo(id) 
}
