import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'cesiumContainer',
      component: () => import("@/page/cesiumContainer")
    },
    {
      path: '/three',
      name: 'threepage',
      component: () => import("@/page/threepage")
    },
    {
      path: '/three4s',
      name: 'three4s',
      component: () => import("@/page/three4s")
    }
  ]
})
