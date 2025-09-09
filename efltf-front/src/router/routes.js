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
      { path: 'endereco', name: 'endereco', component: () => import('pages/EnderecoPage.vue'), meta: { title: 'Cadastro de Endereco' } },
      { path: 'formapag', name: 'formapag', component: () => import('pages/FormaPagamento.vue'), meta: { title: 'Cadastro de Forma de Pagamento' } },
      { path: 'ordemfull', name: 'ordemfull', component: () => import('pages/OrdemFullPage.vue'), meta: { title: 'Cadastro de Ordem' } },
      { path: 'consultaordem', name: 'consultaordem', component: () => import('pages/ConsultaOrdensPage.vue'), meta: { title: 'Consulta de Ordens' } },
      { path: 'consultapagamento', name: 'consultapagamento', component: () => import('pages/OrdemPagConsultaPage.vue'), meta: { title: 'Consulta de Pagamentos' } },
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
