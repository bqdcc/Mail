var express = require('express');
var router = express.Router();
let User = require('./../models/users');
require('./../util/util');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


//登录接口
router.post('/login', (req, res, next) => {
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  };

  User.findOne(param, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      });
    } else {
      if (doc) {
        res.cookie('userId', doc.userId, { // 保存cookie
          path: '/',
          maxAge: 1000 * 60 * 15
        });
        res.cookie('userName', doc.userName, { // 保存cookie
          path: '/',
          maxAge: 1000 * 60 * 15
        });
        //req.session.user = doc;
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  });
});

//登出接口
router.post('/logout', (req, res, next) => {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  });
  res.json({
    status: '0',
    msg: '',
    result: ''
  });
});

// 刷新时获取用户信息
router.get('/checkLogin', (req, res, next) => {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName
    })
  } else {
    res.json({
      status: '1',
      msg: '用户未登录',
      result: ''
    });
  }
});

//获取购物车信息
router.get('/cartList', (req, res, next) => {
  let userId = req.cookies.userId;
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: '用户未登录',
        result: ''
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        });
      }
    }
  });
});

//删除购物车商品
router.post('/cartDel', (req, res, next) => {
  let userId = req.cookies.userId, productId = req.body.productId;
  User.update({userId: userId}, {$pull: {cartList: {productId: productId}}}, (err, doc) => { //删除子文档
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: 'suc'
        });
      }
    }
  });
});

//修改购物车商品信息
router.post('/cartEdit', (req, res, next) => {
  let userId = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked;

  User.update({userId: userId, 'cartList.productId': productId},
    {"cartList.$.productNum": productNum, "cartList.$.checked": checked},
    (err, doc) => {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      } else {
        if (doc) {
          res.json({
            status: '0',
            msg: '',
            result: 'suc'
          });
        }
      }
    });
});

//购物车 全选
router.post('/cartCheckAll', (req, res, next) => {
  let userId = req.cookies.userId,
    checkAll = req.body.checkAll;
  User.findOne({userId: userId}, (err, user) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (user) {
        user.cartList.forEach((item) => {
          item.checked = checkAll;
        });
        user.save((err1, doc1) => {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            });
          } else {
            res.json({
              status: '0',
              msg: '',
              result: 'suc'
            });
          }
        });
      }
    }
  });
});

//获取地址列表
router.get('/addressList', (req, res, next) => {
  let userId = req.cookies.userId;
  User.findOne({userId: userId}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.addressList
        });
      }
    }
  });
});

//修改默认地址
router.post('/setDefaultAddr', (req, res, next) => {
  let userId = req.cookies.userId, addressId = req.body.addressId;
  if (!addressId) {
    res.json({
      status: '1',
      msg: 'addressId is null',
      result: ''
    });
  }else {
    User.findOne({userId: userId}, (err, userDoc) => {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      } else {
        userDoc.addressList.forEach((item) => {
          if (item.addressId == addressId) {
            item.isDefault = true;
          } else {
            item.isDefault = false;
          }
        });
        userDoc.save((err1, doc) => {
          if (err) {
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            });
          } else {
            if (doc) {
              res.json({
                status: '0',
                msg: '',
                result: 'suc'
              });
            }
          }
        });
      }
    });
  }
});

//删除地址
router.post('/delAddress',(req,res,next)=>{
  let userId=req.cookies.userId,addressId=req.body.addressId;
  if (!addressId) {
    res.json({
      status: '1',
      msg: 'addressId is null',
      result: ''
    });
  }else {
    User.update({userId:userId},{$pull:{addressList:{addressId:addressId}}},(err,doc)=>{
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      } else {
        if (doc) {
          res.json({
            status: '0',
            msg: '',
            result: 'suc'
          });
        }
      }
    });
  }
});

//订单确认
router.post('/payMent',(req,res,next)=>{
  let userId=req.cookies.userId,addressId=req.body.addressId,orderTotal=req.body.orderTotal;
  User.findOne({userId:userId},(userErr,userDoc)=>{
    if (userErr) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    }else{
      var address = '',goodsList = [];

      userDoc.addressList.forEach((item)=>{
        if(item.addressId == addressId){
          address = item;
          return ;
        }
      });

      userDoc.cartList.forEach((item)=>{
        if(item.checked == '1'){
          goodsList.push(item);
        }
      });

      var orderId='',createDate='';

      var r1= Math.floor(Math.random()*10);
      var r2= Math.floor(Math.random()*10);
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      orderId='662'+r1+sysDate+r2;

      createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');

      var order={
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:'1',
        createDate:createDate
      };

      userDoc.orderList.push(order);
      userDoc.save((err,doc)=>{
        if (err) {
          res.json({
            status: '1',
            msg: err.message,
            result: ''
          });
        } else {
          if (doc) {
            res.json({
              status: '0',
              msg: '',
              result: {
                orderId:orderId,
                orderTotal:orderTotal
              }
            });
          }
        }
      });

    }
  });
});

//订单成功页面获取 订单信息
router.get('/orderSuccess',(req,res,next)=>{
  let userId=req.cookies.userId,orderId = req.param('orderId');
  User.findOne({userId:userId},(userErr,userInfo)=>{
    if(userErr){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      var orderList = userInfo.orderList;
      if(orderList.length>0){
        let orderTotal = '';
        orderList.forEach((item)=>{
          if(item.orderId == orderId){
            orderTotal = item.orderTotal;
            return ;
          }
        });
        if(orderTotal != ''){
          res.json({
            status:'0',
            msg:'',
            result:{
              orderTotal:orderTotal
            }
          });
        }else{
          res.json({
            status:'120001',
            msg:'不存在此订单',
            result:''
          });
        }
      }else{
        res.json({
          status:'120001',
          msg:'还未创建订单',
          result:''
        });
      }
    }
  });
});

//查询购物车商品数量
router.get('/getCartCount',(req,res,next)=>{
  let userId=req.cookies.userId;
  User.findOne({userId:userId},(err,doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      var cartList = doc.cartList;
      let cartCount = 0;
      cartList.map((item)=>{
        cartCount += parseInt(item.productNum);
      });
      res.json({
        status:'0',
        msg:'',
        result:cartCount
      });
    }

  });
});

module.exports = router;
