require('dotenv').config()
const mongoose =  require("mongoose")
var {User, Sneaker, Stock}= require('../models/user')

// all function to perform when request come to server
var functions = {
    addNew: function(req, res){
        if((!req.body.name) || (!req.body.password)){
            functions.sendBackResponse(res,false,'Enter All Fields!!!')
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
                    functions.sendBackResponse(res,false,'Failed to save!!!')
                } 
                else 
                {
                    functions.sendBackResponse(res,true,'Successfully saved')
                }
            })
        }
    },
    getInfo: function(req, res){
        return functions.sendBackResponse(res,true,req.user)
    },
    getSneakerData: function(req,res){
        console.log(req.body)
        return functions.sendBackResponse(res,true,req.user.data)
    },
    // add new sneaker to the list of user
    addNewSneaker: function(req, res){
        if(!req.body.userID || !req.body.userID.length){
            return functions.sendBackResponse(res,false,"Please include userID")
        }

        if(!req.body.newSneaker || !req.body.newSneaker.length){
            return functions.sendBackResponse(res,false,"Please enter new sneaker info!!!")
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
                    functions.sendBackResponse(res,false,err)
                }
                else{
                    console.log(result)
                    functions.sendBackResponse(res,true,result)
                }
            }
        )
    },
    // remove sneaker in the list
    removeSneaker: function(req, res){
        if(!req.body.userID || !req.body.userID.length){
            return functions.sendBackResponse(res,false,"Please include userID")
        }

        if(!req.body.sneakerID || !req.body.sneakerID.length){
            return  functions.sendBackResponse(res,false,"Please include sneaker info!!!")
        }

        const userID = req.body.userID
        const sneakerID = req.body.sneakerID

        User.findByIdAndUpdate(
            userID,
            {$pull: {
                data: { id: sneakerID}
            }},
            function(err, result){
                if (err){
                    console.log(err);
                    functions.sendBackResponse(res,false,err)
                }
                else{
                    console.log(result)
                    functions.sendBackResponse(res,true,result)
                }
            }
        )
    },
    addNewStock: function(req,res){
        if(!req.body.userID || !req.body.userID.length){
            return functions.sendBackResponse(res,false,"Please include userID")
        }

        if(!req.body.sneakerID || !req.body.sneakerID.length){
            return functions.sendBackResponse(res,false,"Please include sneaker info!!!")
        }

        if(!req.body.newStockInfo || !req.body.newStockInfo.length){
            return functions.sendBackResponse(res,false,"Please include stock info!!!")
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
                    functions.sendBackResponse(res,false,err)
                }
                else{
                    // console.log(result)
                    functions.sendBackResponse(res,true,result)
                }
            }
        )
    },
    removeStock: function(req, res){
        if(!req.body.userID || !req.body.userID.length){
            return functions.sendBackResponse(res,false,"Please include userID")
        }

        if(!req.body.sneakerID || !req.body.sneakerID.length){
            return functions.sendBackResponse(res,false,"Please include sneaker info!!!")
        }

        if(!req.body.stockID || !req.body.stockID.length){
            return functions.sendBackResponse(res,false,"Please include stock id info!")
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
                    functions.sendBackResponse(res,false,err)
                }
                else{
                    // console.log(result)
                    functions.sendBackResponse(res,true,result)
                }
            }
        )
    },
    updateSneaker: function(req,res) {
        if(!req.body.userID || !req.body.userID.length){
            return functions.sendBackResponse(res,false,"Please include userID")
        }

        if(!req.body.sneakerID || !req.body.sneakerID.length){
            return functions.sendBackResponse(res,false,"Please include sneakerID!!!")
        }

        if(!req.body.updateStockInfo || !req.body.updateStockInfo.length){
            return functions.sendBackResponse(res,false,"Please include stock info to update!")
        }

        const sneaker = JSON.parse(req.body.updateStockInfo)
        const userID = req.body.userID
        const sneakerID = req.body.sneakerID
        
        User.findOneAndUpdate(
            { _id: userID, 
              data: { $elemMatch: { id: sneakerID}} 
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
                    functions.sendBackResponse(res,false,err)
                }
                else{
                    // console.log(result)
                    functions.sendBackResponse(res,true,result)
                }
            }
        )

    },
    sendBackResponse: function(res,status,data){
        res.setHeader('Content-Type', 'application/json')
        res.json(JSON.stringify({success: status, msg: data}))
    }
}

module.exports = functions