var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var produtSchema = new Schema({
  "productId":{type:String},
  "productName":String,
  "salePrice":Number,
  "productNum":Number,
  "checked":String,
  "ProductImage":String
});

module.exports = mongoose.model('Good',produtSchema);