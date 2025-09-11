import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
})

export default boot(({ app, router }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api   = api

  // Se qualquer requisição voltar 401, manda pro /login
  api.interceptors.response.use(
    r => r,
    err => {
      const status = err?.response?.status
      if (status === 401 && router?.currentRoute?.value?.path !== '/login') {
        router.push('/login')
      }
      return Promise.reject(err)
    }
  )
})

export { api }