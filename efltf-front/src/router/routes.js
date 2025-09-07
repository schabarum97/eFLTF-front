const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/IndexPage.vue'), meta: { title: 'eFLTF' } },
      { path: 'uf', name: 'uf', component: () => import('pages/UfPage.vue'), meta: { title: 'Cadastro de UF' } },
      { path: 'status', name: 'status', component: () => import('pages/StatusPage.vue'), meta: { title: 'Cadastro de Status' } },
      { path: 'cidade', name: 'cidade', component: () => import('pages/CidadePage.vue'), meta: { title: 'Cadastro de Cidade' } },
      { path: 'cliente', name: 'cliente', component: () => import('pages/ClientePage.vue'), meta: { title: 'Cadastro de Cliente' } },
      { path: 'endereco', name: 'endereco', component: () => import('pages/EnderecoPage.vue'), meta: { title: 'Cadastro de Endereco' } }
    ]
  },

  // 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
