const express =require("express");
const app = express();
const bodyParser=require("body-parser");
const mongoose = require('mongoose');
const device=require('./model/device');
const User=require('./model/user');
const authroutes=require("./routes/auth.js");
const jwt=require('jsonwebtoken')
const deviceroutes=require("./routes/device.js");
const searchauth=require('./routes/search');
const comment=require("./model/comments");
const cors=require('cors')
const mailer=require('@sendgrid/mail')
mailer.setApiKey('')
mongoose.connect('',
{useMongoClient:true});
mongoose.Promise = global.Promise;
app.use(bodyParser.json());
app.use(cors())
app.use(function(req,res,next){
    try{
    const token = req.headers.authorization.split(" ")[1]
    console.log(token)
    jwt.verify(token, key.tokenKey, function (err, payload) {
        console.log(payload)
        if (payload) {
            User.findById(payload.userId).then(
                (doc)=>{
                    req.user=doc;
                    next()
                }
            )
        } else {
           next()
        }
    })
}catch(e){
    next()
}
})

app.use(express.static(__dirname + '/public'))
//app.use(express.static('View'))
app.use(deviceroutes);
app.use(searchauth);
app.use(authroutes);
app.get("*",function(req,res){
res.sendFile(__dirname+'/public/index.html');

})
app.listen(process.env.PORT||3001,function(){
    console.log("done");
})
