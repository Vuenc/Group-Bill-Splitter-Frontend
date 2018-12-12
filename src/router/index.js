import Vue from 'vue'
import Router from 'vue-router'
import GroupEvent from '@/components/GroupEvent'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/groupEvents/:id',
      name: 'GroupEvent',
      component: GroupEvent
    }
  ]
})
