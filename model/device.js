const express =require("express");
const app = express();
const mongoose = require('mongoose');
const blog=new mongoose.Schema({
    name:String,
    image:String,
    text:String,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
    },
    tags:{
       type: [String],
       index:"text",
    },
    like:{
        type:Number,
        default:0
    },
    comment:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'comment'
    }],
    likedby:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
    }],
    bookmarked:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    readTime:{
        type:Number,
        default:0,
    }

},{timestamps:true});

//objectSchema.plugin(textSearch);
blog.index({ tags: 'text' });
// adding device collection
module.exports=mongoose.model("tech",blog);
/*device.create({name:"anshul",image:"helo"},function(err,device){
    if(err){
        console.log(err);
    }else{
        console.log(device);
    }
});
*/
