import { api } from '../boot/axios'

export const ChatTeste = {
  async enviar ({ de, nome, texto }) {
    const { data } = await api.post('/chat/test', { de, nome, texto })
    return data
  }
}
