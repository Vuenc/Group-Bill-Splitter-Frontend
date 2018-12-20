import Vue from 'vue'
import Router from 'vue-router'
import GroupEvent from '@/components/GroupEvent'
import CreateGroupEvent from '@/components/CreateGroupEvent'
import LandingPage from '@/components/LandingPage'
import About from '@/components/About'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/groupEvents/:id',
      name: 'GroupEvent',
      component: GroupEvent
    },
    {
      path: '/groupEvents',
      name: 'CreateGroupEvent',
      component: CreateGroupEvent
    },
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ]
})
