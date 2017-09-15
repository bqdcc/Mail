// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'

Vue.use(infiniteScroll)

Vue.use(Vuex)

Vue.use(VueLazyLoad,{
  loading: '/static/loading/loading-bars.svg',
})

const store = new Vuex.Store({
  state:{
    nickName:'',
    cartCount:0
  },
  mutations:{
    updateNickName(state,uname){
      state.nickName = uname;
    },
    updateCartCount(state,count){
      state.cartCount += count;
    },
    initCartCount(state,count){
      state.cartCount=count
    }
  }
})


Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }

})
