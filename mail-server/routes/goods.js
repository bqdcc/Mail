var mongoose = require('mongoose');
var express = require('express')
var router = express.Router();
var Goods =  require('./../models/goods');



mongoose.connect('mongodb://127.0.0.1:27017/db_demo');

mongoose.connection.on("connected",function () {
  console.log("MongoDB connected success.");
});

mongoose.connection.on("error",function () {
  console.log("MongoDB connected fail");
});

mongoose.connection.on("disconnected", function () {
  console.log("MongoDB connected disconnected");
});

//查询列表商品数据
router.get("/",(req,res,next)=>{
  let page = parseInt(req.param("page"));
  let pageSize = parseInt(req.param("pageSize"));
  let priceLevel = req.param('priceLevel');
  let sort = req.param("sort");
  let skip = (page-1)*pageSize;
  let params = {};
  var priceGt = '',priceLte = '';
  if(priceLevel!='all'){
    switch (priceLevel){
      case '0': priceGt = 0;priceLte=100;break;
      case '1': priceGt = 100;priceLte=500;break;
      case '2': priceGt = 500;priceLte=1000;break;
      case '3': priceGt = 1000;priceLte=5000;break;
    }
    params = {
      salePrice:{
        $gt:priceGt,
        $lte:priceLte
      }
    }
  }

  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec({},(err,doc)=>{
    if(err){
     res.json({
       status:'1',
       msg:err.message
     }) ;
    }else{
      res.json({
        status:'0',
        msg:'',
        result:{
          count:doc.length,
          list:doc
        }
      })
    }
  });
});

//加入到购物车
router.post('/addCart',(req,res,next)=>{
  let userId=req.cookies.userId,productId = req.body.productId;
  let User = require('../models/users');

  User.findOne({userId:userId},(err,userDoc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message
      }) ;

    }else {
      if(userDoc){
        var productItem='';
        userDoc.cartList.forEach(item=>{
          if(item.productId==productId){
            productItem=item;
            item.productNum++;
          }
        });
        if(productItem){
          userDoc.save((err2,doc2)=>{
            if(err2){
              res.json({
                status:'1',
                msg:err2.message
              }) ;
            }else{
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              })
            }
          });
        }else{
          Goods.findOne({productId:productId},(err1,doc1)=>{
            if(err1){
              res.json({
                status:'1',
                msg:err1.message
              }) ;
            }else{
              if(doc1){
                doc1.productNum = 1;
                doc1.checked = 1;
                userDoc.cartList.push(doc1);
                userDoc.save((err2,doc2)=>{
                  if(err2){
                    res.json({
                      status:'1',
                      msg:err2.message
                    }) ;
                  }else{
                    res.json({
                      status:'0',
                      msg:'',
                      result:'suc'
                    })
                  }
                });
              }
            }
          });
        }

      }


    }
  });

});

module.exports = router;