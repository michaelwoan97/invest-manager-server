require('dotenv').config()
const mongoose =  require("mongoose")
var {User, Sneaker, Stock}= require('../models/user')
var jwt = require('jwt-simple')
const jsonwt = require('jsonwebtoken')
var config = require('../config/dbconfig')
const { isObjectIdOrHexString } = require('mongoose')

// all function to perform when request come to server
var functions = {
    addNew: function(req, res){
        if((!req.body.name) || (!req.body.password)){
            res.json({success: false, msg: 'Enter All Fields!!!'})
        }
        else 
        {
            let sneakerData = req.body.data.length ? JSON.parse(req.body.data) : []

            var newUser = User({
                name: req.body.name,
                password: req.body.password,
                data:  sneakerData
            })
            
            
            newUser.save(function(err, newUser){
                if(err){
                    res.json({success: false, msg: 'Failed to save!!!'})
                } 
                else 
                {
                    res.json({success: true, msg: 'Successfully saved'})
                }
            })
        }
    },
    authenticate: function(req,res){
        User.findOne({
            name: req.body.name
        }, function(err, user){
            if(err) throw err
            if(!user){
                res.status(403).send({success: false, msg:'Authentication Failed, User not found'})
            }
            else 
            {
                user.comparePassword(req.body.password, function(err, isMatch){
                    if(isMatch && !err){
                        const token = jsonwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET)
                        res.json({success: true, token: token})
                    }
                    else 
                    {
                        return res.status(403).send({success: false, msg: 'Authentication failed, wrong password'})
                    }
                })
            }
        })
    },
    getInfo: function(req, res){
        return res.json({success: true, msg: req.user})
    },
    getSneakerData: function(req,res){
        return res.json({success: true, msg: req.user.data})
    },
    // add new sneaker to the list of user
    addNewSneaker: function(req, res){
        if(!req.body.userID || !req.body.userID.length){
            return res.json({success: false, msg: "Please include userID"})
        }

        if(!req.body.newSneaker || !req.body.newSneaker.length){
            return res.json({success: false, msg: "Please enter new sneaker info!!!"})
        }
        
        const userID = req.body.userID
        const newSneakerInfo = JSON.parse(req.body.newSneaker)
        const newStockInfo = newSneakerInfo.available.length ? newSneakerInfo.available : []
        let arrNewStockData = []

        // create new stock info elements
        for(let i = 0; i < newStockInfo.length; i++){
            let newStockData = Stock({
                seller: newStockInfo[i].seller,
                date: newStockInfo[i].date,
                size: newStockInfo[i].size,
                price: newStockInfo[i].price,
                isSold: newStockInfo[i].isSold,
                priceSold: newStockInfo[i].priceSold
            })
            arrNewStockData.push(newStockData);
            
        }
    
        // create new sneaker info
        let newSneaker = Sneaker({
            id: newSneakerInfo.id,
            name: newSneakerInfo.name,
            notes: newSneakerInfo.notes,
            img: newSneakerInfo.img,
            available: arrNewStockData
        })

        User.findOneAndUpdate(
            {_id: userID},
            {$push: {data: newSneaker}},
            function(err, result){
                if (err){
                    console.log(err);
                    res.send({success: false, msg: err})
                }
                else{
                    console.log(result)
                    res.send({success: true, msg: result})
                }
            }
        )
    },
    // remove sneaker in the list
    removeSneaker: function(req, res){
        if(!req.body.userID || !req.body.userID.length){
            return res.json({success: false, msg: "Please include userID"})
        }

        if(!req.body.sneakerID || !req.body.sneakerID.length){
            return res.json({success: false, msg: "Please include sneaker info!!!"})
        }

        const userID = req.body.userID
        const sneakerID = req.body.sneakerID

        User.findByIdAndUpdate(
            userID,
            {$pull: {
                data: { _id: mongoose.Types.ObjectId(sneakerID)}
            }},
            function(err, result){
                if (err){
                    console.log(err);
                    res.send({success: false, msg: err})
                }
                else{
                    console.log(result)
                    res.send({success: true, msg: result})
                }
            }
        )
    },
    addNewStock: function(req,res){
        if(!req.body.userID || !req.body.userID.length){
            return res.json({success: false, msg: "Please include userID"})
        }

        if(!req.body.sneakerID || !req.body.sneakerID.length){
            return res.json({success: false, msg: "Please include sneaker info!!!"})
        }

        if(!req.body.newStockInfo || !req.body.newStockInfo.length){
            return res.json({success: false, msg: "Please include stock info!!!"})
        }

        const userID = req.body.userID
        const sneakerID = req.body.sneakerID
        const newStockInfo = JSON.parse(req.body.newStockInfo)
        // create new sneaker info
        let newStockData = Stock({
            seller: newStockInfo.seller,
            date: newStockInfo.date,
            size: newStockInfo.size,
            price: newStockInfo.price,
            isSold: newStockInfo.isSold,
            priceSold: newStockInfo.priceSold
        })
        
        User.findOneAndUpdate(
            { _id: userID, 
              data: { $elemMatch: { _id: sneakerID}} 
            },
            // $ operator in the line below represent for the result that
            // returned from the querry
            { $push: { "data.$.available": newStockData}},
            function(err,result){
                if (err){
                    console.log(err);
                    res.send({success: false, msg: err})
                }
                else{
                    // console.log(result)
                    res.send({success: true, msg: result})
                }
            }
        )
    },
    removeStock: function(req, res){
        if(!req.body.userID || !req.body.userID.length){
            return res.json({success: false, msg: "Please include userID"})
        }

        if(!req.body.sneakerID || !req.body.sneakerID.length){
            return res.json({success: false, msg: "Please include sneaker info!!!"})
        }

        if(!req.body.stockID || !req.body.stockID.length){
            return res.json({success: false, msg: "Please include stock id info!"})
        }

        const userID = req.body.userID
        const sneakerID = req.body.sneakerID
        const stockID = req.body.stockID

        User.findOneAndUpdate(
            { _id: userID, 
               data: { $elemMatch: { _id: sneakerID}} 
            },
            // $ operator in the line below represent for the result that
            // returned from the querry
            { $pull: { 
                    "data.$.available":  {_id: stockID}
            }},
            function(err,result){
                if (err){
                    console.log(err);
                    res.send({success: false, msg: err})
                }
                else{
                    // console.log(result)
                    res.send({success: true, msg: result})
                }
            }
        )
    },
    updateSneaker: function(req,res) {
        if(!req.body.userID || !req.body.userID.length){
            return res.json({success: false, msg: "Please include userID"})
        }

        if(!req.body.sneakerID || !req.body.sneakerID.length){
            return res.json({success: false, msg: "Please include sneakerID!!!"})
        }

        if(!req.body.updateStockInfo || !req.body.updateStockInfo.length){
            return res.json({success: false, msg: "Please include stock info to update!"})
        }

        const sneaker = JSON.parse(req.body.updateStockInfo)
        const userID = req.body.userID
        const sneakerID = req.body.sneakerID
        

        User.findOneAndUpdate(
            { _id: userID, 
              data: { $elemMatch: { _id: sneakerID}} 
            },
            {
                $set: { 
                    "data.$.name": sneaker.name,
                    "data.$.notes": sneaker.notes,
                    "data.$.img": sneaker.img,
                    "data.$.available": sneaker.available,
                }
            },
            function(err, result){
                if (err){
                    console.log(err);
                    res.send({success: false, msg: err})
                }
                else{
                    // console.log(result)
                    res.send({success: true, msg: result})
                }
            }
        )

    },
    // middleware to authenticate
    authenticateToken: function(req, res, next){
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if(token == null) return res.sendStatus(401)

        jsonwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.sendStatus(403)
            req.user = user
            next()
        })
    }
}

module.exports = functions