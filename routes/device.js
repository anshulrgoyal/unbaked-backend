const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const key=require('../conf/key')
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({
    storage: storage,
    fileFilter: imageFilter
});

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: key.cloud_name,
    api_key: key.api_key,
    api_secret: key.api_secret
});

const escapeRegex = require('../conf/search');
const device = require('../model/device');
const user = require('../model/user');
const comment = require("../model/comments");
const middlewareobject = require("../middleware/middleware.js");
router.get("/api/device/best", function (req, res) {
    device.find({}).sort('-like').exec(function (err,doc) {
        res.json({
            blog: doc,
        });
    });

});
router.get("/api/device/viral", function (req, res) {
    device.find({}).sort('-readTime').exec(function (err,doc) {
        res.json({
            blog: doc,
        });
    });
});
router.get("/api/device/new", function (req, res) {
    device.find({}).sort('-createdAt').exec(function (err,doc) {
        res.json({
            blog: doc,
        });
    });

});
router.get('/api/device/user',function(req,res){
  try{
    user.findById(req.user._id).then((doc)=>{
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
  }  
     catch(e){
         device.find({}).then((doc)=>{
res.json({
    blog:doc
})
         })
     } 
  })

router.get("/api/device/:id", function (req, res) {
    var id = req.params.id;
    var promise = device.findById(req.params.id).populate('author', 'first image').
        populate({
            path: 'comment',
            populate: {
                path: 'author',
                select: 'first image',
            }
        });
    promise.then(function (doc) {
        res.json(doc);
    }).catch(function (err) {
        console.log(err);
    });

});
router.post("/api",middlewareobject.checklogin, function (req, res) {
        req.body.tags=req.body.tags.split(" ")
        var newdevice = new device(req.body)
        newdevice.author=req.user._id
        newdevice.save(function(err){
            res.json(newdevice)
        })
        
    ;
});
router.put("/api/device/:id",
    middlewareobject.onwership,
    function (req, res) {
       
            var id = req.params.id;
            var name = req.body.name;
            var image = req.body.image;
            var text = req.body.text;
            dev = {
                name: name,
                image: image,
                text: text
            };
            device.findOne({
                _id: req.params.id
            }).then((err, doc) =>{
                doc.name = req.body.name;
                doc.save();
                doc.image = req.body.image;
                doc.save();
                doc.text = req.body.text;
                doc.save()
                res.json(doc)

           
        });
    });
router.delete("/api/device/:id", middlewareobject.onwership, function (req, res) {
    var id = req.params.id;
    device.findByIdAndRemove(id, function (err) {
        res.json({message:"done"});
    });
});
router.post("/api/device/:id", middlewareobject.checklogin, function (req, res) {
    var id = req.params.id;
    device.findById(id, function (err, dev) {
        if (err) {
            console.log(err);
        } else {
            console.log("added newdevice ");
        }
        var newcomment = {
            text: req.body.text,
            author: req.user._id,
        };
        comment.create(newcomment,
            function (err, foundcomment) {
                if (err) {
                    console.log(err);
                } else {
                    dev.comment.push(foundcomment);
                    dev.save();
                }
                foundcomment.author.first=req.user.first;
                foundcomment.author.image=req.user.image;
                comm={
                    text:foundcomment.text,
                    author:{
                        first:req.user.first,
                        image:req.user.image
                    }
                }
                res.json(comm)

            });


    });
});

router.post('/api/file', upload.single('image'),function(req,res){
  cloudinary.uploader.upload(req.file.path, function (result) {
      res.json({url:result.secure_url})
})
    
    
    
}
)

module.exports = router;
