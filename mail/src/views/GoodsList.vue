<template>
  <div>
    <nav-header></nav-header>
    <nav-bread>
      <span>Goods</span>
    </nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">Sort by:</span>
          <a href="javascript:void(0)" class="default cur">Default</a>
          <a @click="sortGoods" href="javascript:void(0)" class="price">
            Price
            <span class="icon-arrow-short" :class="{'short-up':!sortFlag}">
              ↓
            </span>
          </a>
          <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" :class="{'filterby-show':filterBy}">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd @click="setPriceFilter('all')"><a href="javascript:void(0)" :class="{'cur':priceChecked=='all'}">All</a></dd>
              <dd v-for="(price,index) in priceFilter" @click="setPriceFilter(index)">
                <a href="javascript:void(0)" :class="{'cur':priceChecked == index}">{{price.priceStart}} - {{price.priceEnd}}</a>
              </dd>

            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="(item,index) in goodsList">
                  <div class="pic">
                    <a href="#"><img v-lazy="'/static/'+item.productImage"></a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>
              <div class="loadMore" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
      <p slot="msg">
        未登录，不能加入购物车！
      </p>
      <div slot="btn-group">
        <a href="javascript:;" class="btn btn--m" @click="mdShow=false">关闭</a>
      </div>
    </modal>

    <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
      <p slot="msg">
        <span>√</span>
        <span>加入购物车成功！</span>
      </p>
      <div slot="btn-group">
        <a href="javascript:;" class="btn btn--m" @click="mdShowCart=false">继续购物</a>
        <router-link href="javascript:;" class="btn btn--m" to="/cart">查看购物车</router-link>
      </div>
    </modal>

    <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>

    <nav-footer></nav-footer>
  </div>
</template>

<script>
  import '@/assets/css/base.css'
  import '@/assets/css/product.css'
  import NavHeader from '@/components/Header'
  import NavFooter from '@/components/Footer'
  import NavBread from '@/components/Bread'
  import Modal from '@/components/Modal'
  import axios from 'axios'
  export default {
    data () {
      return {
        goodsList:[],//产品列表
        priceFilter:[ //价格区间
          {
            priceStart:0,
            priceEnd:100
          },
          {
            priceStart:100,
            priceEnd:500
          },
          {
            priceStart:500,
            priceEnd:1000
          },
          {
            priceStart:1000,
            priceEnd:5000
          }
        ],
        priceChecked:'all',  //价格标签选中
        filterBy:false,    //价格右侧栏显示隐藏
        overLayFlag:false,  //模态框显示隐藏
        sortFlag:true,          //排序规则
        page:1,       //页码
        pageSize:8,    //每页显示数量
        busy:true,   //是否禁用加载
        loading:false,  //加载动画
        mdShow:false,  // 控制 未登录状态下加入购物车 模态框显示隐藏
        mdShowCart:false //控制 已登录 状态下 加入购物车 模态框显示隐藏
      }
    },
    mounted(){
      this.$nextTick(function () {
        this.getGoodsList();

      })
    },
    methods: {

      getGoodsList(flag){// 得到商品数据
        let param = {
          page:this.page,
          pageSize:8,
          sort:this.sortFlag?1:-1,  // 1升序 -1降序
          priceLevel:this.priceChecked
        }
        this.loading = true
        axios.get('/goods',{
          params:param
        }).then(res=>{
          this.loading = false
          if(res.data.status=="0"){
            if(flag){
              this.goodsList = this.goodsList.concat(res.data.result.list)
              if(res.data.result.count<8){
                this.busy = true
              }else{
                this.busy = false
              }
            }else{
              this.goodsList = res.data.result.list

              this.busy = false
            }
          }else{
            this.goodsList = []
          }
        })
      },
      sortGoods(){//根据价格排序
        this.sortFlag = !this.sortFlag
        this.page = 1
        this.getGoodsList()
      },
      loadMore(){  //滚动加载
        this.busy = true   //触发加载时间后禁用加载否则鼠标滚动 会重复触发
        this.page++
        setTimeout(() => {
          this.getGoodsList(true)
          this.busy = false; //上一个加载事件完成后 才允许可以继续触发滚动加载事件
        }, 500);
      },
      addCart(productId){//加入购物车
        axios.post('/goods/addCart',{
          productId:productId
        }).then((res)=>{
          if(res.data.status=='0'){
            this.mdShowCart=true
            this.$store.commit('updateCartCount',1)
            //alert('加入成功')
          }else{
            this.mdShow=true
            //alert(res.data.msg)
          }
        })
      },
      closePop(){
        this.filterBy=false
        this.overLayFlag=false
      },
      showFilterPop(){
        this.filterBy=true
        this.overLayFlag=true
      },
      setPriceFilter(index){
        this.priceChecked=index
        this.page = 1
        this.getGoodsList()
        this.closePop()
      },
      closeModal(){
        this.mdShow=false
        this.mdShowCart=false
      }
    },
    components:{
      NavHeader,
      NavFooter,
      NavBread,
      Modal
    }
  }
</script>

<style>
  .list-wrap ul::after{
    clear: both;
    content:'' ;
    height:0;
    display: block;
    visibility: hidden;
  }
  .loadMore{
    text-align: center;
    height: 100px;
  }
  .short-up{
    transform: rotate(180deg);

    transition: all .3s ease-out;
  }

</style>
