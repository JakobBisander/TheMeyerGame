const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', name: 'start', component: () => import('pages/Index.vue') },
      {
        path: 'lobby',
        name: 'lobby',
        component: () => import('pages/Lobby.vue')
      },
      {
        path: 'game',
        name: 'game',
        component: () => import('pages/Game.vue')
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
