import Vue from 'vue'
import Router from 'vue-router'
import cesiumContainer from '@/components/cesiumContainer'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'cesiumContainer',
      component: cesiumContainer
    },
    {
      path: '/three',
      name: 'threepage',
      component: () => import("@/components/threepage")
    },
    {
      path: '/three4s',
      name: 'three4s',
      component: () => import("@/components/three4s")
    }
  ]
})
