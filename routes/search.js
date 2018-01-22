



var express = require("express");
var router = express.Router();
var mongoose = require('mongoose');
var inspect = require('util').inspect;
var escapeRegex = require('../conf/search');
var device = require('../model/device')
const middlewareobject = require("../middleware/middleware.js");
router.get("/api/search/:term", function (req, res) {
    const regex = new RegExp(escapeRegex(req.params.term), 'gi');
    device.find({ tags: regex }).sort('-readTime').exec(function (err, output) {
        console.log(output);
        res.json({ output });

    });
});
router.get('/api/read/:id', function (req, res) {
    device.findById(req.params.id).then((doc) => {
        doc.readTime = doc.readTime + 1;
        doc.save();
        res.json({doc})
    })
})
router.get('/api/like/:id', middlewareobject.checklogin,function (req, res) {
    device.findById(req.params.id).then((doc) => {
        if(doc.likedby.indexOf(req.user._id)==-1){
          doc.likedby.push(req.user._id)
          doc.like=doc.likedby.length;
          doc.save()
          res.json(doc)
        }
        else{
            doc.likedby.splice(doc.likedby.indexOf(req.user._id),1)
            doc.like=doc.likedby.length;
            doc.save()
            res.json(doc)
        }
     // console.log( doc.likedby.indexOf(req.user._id))
    })
})
router.get('/api/tag/:id',function(req,res){
    /* var de=[""]
    var promise=new Promise((resolve,reject)=>{
        device.findById(req.params.id).then((doc)=>{
   
        const regex = new RegExp(escapeRegex(doc.tags[0]), 'gi');
        console.log(de)
        device.find({tags:regex}).then((blog)=>{
         res.json({blog})
        
        })

    resolve(console.log(de))
})
    })
    */
     device.findById(req.params.id).then((doc)=>{
      const action= doc.tags.map((data)=>{
           /* return new Promise((resolve)=>{
               const regex = new RegExp(escapeRegex(data), 'gi');
               resolve(device.find({tags:regex}));
            })*/
            const regex = new RegExp(escapeRegex(data), 'gi');
            return Promise.resolve(device.find({tags:regex}) )
        })
        Promise.all(action).then((blogs)=>{
         const output=  [].concat(...blogs);
        const result= Array.from(new Set (output.map((data)=>{
             return JSON.stringify(data);
         })))
         res.json({blog:result.map((data)=>{
             return JSON.parse(data)
         })})
        })
    })
    
})
module.exports = router;
