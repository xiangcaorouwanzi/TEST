/**
 * Created by Administrator on 2017/11/15.
 */
var mongoose=require("mongoose");
var usersSchema=require('../schemas/users');

module.exports=mongoose.model('User',usersSchema);