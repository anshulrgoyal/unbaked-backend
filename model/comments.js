var mongoose = require('mongoose');
var commentSchema=new mongoose.Schema({
text:String,
author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
}
},{timestamps:true});
module.exports=mongoose.model("comment",commentSchema);
