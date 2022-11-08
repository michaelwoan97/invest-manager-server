var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')

var stockSchema = new Schema({
    seller: {
        type: String
    },
    date: {
        type: String
    },
    size: {
        type: String
    },
    price: {
        type: String
    },
    isSold: {
        type: Boolean
    },
    priceSold: {
        type: String
    },
    
})

var sneakerSchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    notes: {
        type: String
    },
    img: {
        type: String
    },
    available: [
        stockSchema,
    ]
})
// user schema objects
var userSchema = new Schema({
    name: {
        type: String,
        require:true 
    },
    password:{
        type: String,
        require: true
    },
    // data:[
    //     sneakerSchema
    // ]
    data:[
        {
            id: String,
            name: String,
            notes: String,
            img: String,
            available: [
                {
                    seller: String,
                    date: String,
                    size: String,
                    price: String,
                    isSold: Boolean,
                    priceSold: String
                }
            ]
        }
    ]
})

// method when user tried to create a new account
userSchema.pre('save', function(next) {
    var user = this;
    if(this.isModified('password' || this.isNew)){
        bcrypt.genSalt(10, function (err, salt) {
            if(err){
                return next(err)
            }
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
        
    }
    next()
})

// Compare the password
userSchema.methods.comparePassword = function(passw, cb){
    bcrypt.compare(passw, this.password, function(err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.methods.addNewSneakers = function(newSneaker){
    var user = this
    user.data.push(newSneaker)
}

const user = mongoose.model('User', userSchema)
const sneaker = mongoose.model('Sneaker', sneakerSchema)
const stock = mongoose.model('Stock', stockSchema)

module.exports = {
    User: user,
    Sneaker: sneaker,
    Stock: stock
}