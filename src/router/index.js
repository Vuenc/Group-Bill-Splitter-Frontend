import Vue from 'vue'
import Router from 'vue-router'
import GroupEvent from '@/components/GroupEvent'
import CreateGroupEvent from '@/components/CreateGroupEvent'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/groupEvents/:id',
      name: 'GroupEvent',
      component: GroupEvent
    },
    {
      path: '/',
      name: 'CreateGroupEvent',
      component: CreateGroupEvent
    }
  ]
})
