import Vue from 'vue'
import Router from 'vue-router'
import GoodsList from './../views/GoodsList'
import Cart from './../views/Cart'
import Address from './../views/Address'
import Order from './../views/Order'
import OrderSuccess from './../views/OrderSuccess'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'GoodsList',
      component: GoodsList
    },
    {
      path: '/cart',
      name: 'Cart',
      component: Cart
    },
    {
      path: '/address',
      name: 'Address',
      component: Address
    },
    {
      path: '/order',
      name: 'Order',
      component: Order
    },
    {
      path: '/orderSuccess',
      name: 'OrderSuccess',
      component: OrderSuccess
    }
  ]
})
