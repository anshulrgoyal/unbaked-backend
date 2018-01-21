var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')
var userSchema = new mongoose.Schema({
    first: String,
    email: {type:String},
    image: {
    type:String,
    default:"default"
    },
    activation:{type:Boolean,default:false},
    tags: [String],
    post: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device',
    }],
    likedpost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device',
        
    }],
    username: {type:String},
    password: String,
},{timestamps:true})

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {return next()};
    bcrypt.hash(user.password,10).then((hashedPassword) => {
        user.password = hashedPassword;
        next();
    })
}, function (err) {
    next(err)
})
userSchema.methods.comparePassword=function(candidatePassword,next){
    bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
        if(err) return next(err);
        next(null,isMatch)
    })
}
module.exports = mongoose.model("user", userSchema);
