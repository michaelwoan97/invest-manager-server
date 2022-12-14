require('dotenv').config()
const mongoose =  require("mongoose")
const fs = require('fs')
var {User, Sneaker, Stock}= require('../models/user')
const path = require('path')
const emailValidator = require("validator")
const nodemailer = require('nodemailer')


const IMAGEDIR = "/../users-sneaker-images/"
const USERSIMAGEDIR = path.join(__dirname+IMAGEDIR)
const IMAGENAME = "sneaker-image"
const ESCAPESLASH = "//"
const ESCAPEDOUBLESLASH = "////"

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
            
            // check whether user registered with valid email
            if(emailValidator.isEmail(req.body.name)){
                // check whether the new user is already existed
                User.findOne({name: req.body.name}).then(result => {
                    if(result){
                        const errorMsg = "User with name" + " " + req.body.name +" is already existed"
                        console.log(errorMsg)
                        return functions.sendBackResponse(res,false,errorMsg)
                    } else {
                        newUser.save(function(err, newUser){
                            if(err){
                                functions.sendBackResponse(res,false,'Failed to save!!!')
                            } 
                            else 
                            {
                                // const transporter = nodemailer.createTransport({
                                //     service: 'gmail',
                                //     auth: {
                                //         user: 'NorbertoKoutras6114@gmail.com',
                                //         pass: 'djAxbT@IRC!Gi#S9R'
                                //     }
                                // });

                                // transporter.verify(function (error, success) {
                                //     if(error) {
                                //         console.log(error);
                                //     } else { 
                                //         console.log('Server validation done and ready for messages.') 
                                //         const email = {
                                //             from: 'SophiaBrincat3528@gmail.com',
                                //             to: req.body.name,
                                //             subject: 'Welcome To Invest Manager',
                                //             text: 'Hello! Welcome to Invest Manager!'
                                //         };
                                //         transporter.sendMail(email, function(error, success){
                                //             if (error) {
                                //                 console.log(error);
                                //             } else {
                                //                 console.log('Nodemailer Email sent: ' + success.response);
                                //             }
                                //         });

                                //     }
                                // });



                                functions.sendBackResponse(res,true,'Successfully saved')
                            }
                        })
                    }
                })
            } else {
                const errorMsg = "User with registered email " + " " + req.body.name +" is not a valid email!!"
                console.log(errorMsg)
                return functions.sendBackResponse(res,false,errorMsg)
            }
            

            
        }
    },
    getInfo: function(req, res){
        return functions.sendBackResponse(res,true,req.user)
        // res.setHeader('Content-Type', 'application/json')
        // res.json({success: true, msg: req.user.data})
    },
    processRequestImages: async function(res, data){
        for(let sneaker of data){
            if(sneaker.img != null && sneaker.img.length){
                let sneakerImageFile = sneaker.img.split('//').join("////")
                // console.log(sneakerImageFile)
                await fs.promises.readFile(sneakerImageFile, "base64")
                .then(function (result) {
                    sneaker.img = result
                    // console.log("success"+ sneaker.img)
                })
                .catch(function (err){
                    console.log(err)
                    return functions.sendBackResponse(res,false,err)
                })
            }
        }

        functions.sendBackResponse(res,true,data)

    },
    getSneakerData: function(req,res){
        // loop through data array
            // check whether the img is existed
                // get the path of the img file
                    // read it 
                    // convert it to base 64
                    // change img
        // send it back
        User.findById(req.user.userID).then( sneaker =>{
            if(sneaker == null){
                return functions.sendBackResponse(res,false,"User Not Existed!!!")
            } else {
                functions.processRequestImages(res, sneaker.data)
            }
            
        })
        

        // return functions.sendBackResponse(res,true,req.user.data)
        // res.setHeader('Content-Type', 'application/json')
        // console.log({success: true, msg: req.user})
        // res.json({success: true, msg: req.user.data})
    },
    // add new sneaker to the list of user
    addNewSneaker: function(req, res){
        if(!req.body.userID || !req.body.userID.length){
            return functions.sendBackResponse(res,false,"Please include userID")
        }

        if(!req.body.newSneaker){
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

        

        // User.findOneAndUpdate(
        //     {_id: userID},
        //     {$push: {data: newSneaker}},
        //     function(err, result){
        //         if (err){
        //             console.log(err);
        //             functions.sendBackResponse(res,false,err)
        //         }
        //         else{
        //             console.log(result)
        //             functions.sendBackResponse(res,true,result)
        //         }
        //     }
        // )

        User.findById(userID).then(function (user) {
            if(user == null){
                return functions.sendBackResponse(res,false,"User Not Existed!!!")
            }
            // check whether the folder for storing sneaker image of user exist
            let usersImageDir = USERSIMAGEDIR
            let imgUserDir = path.join(usersImageDir+user.name+"/")
            // if(!fs.existsSync(imgUserDir)){
            //     fs.mkdirSync(imgUserDir, { recursive: true })
            // }
            fs.mkdir(imgUserDir, (err) => {
                if(err){
                    if(err.code != 'EEXIST'){
                        console.log(err);
                        return functions.sendBackResponse(res,false,err)
                    }
                }

                // create seperate dir for storing image under users's sneaker image folder
                let sneakerImgDir = path.join(imgUserDir+newSneaker._id+"/")
                fs.mkdir(sneakerImgDir, (err) => {
                    if(err){
                        if(err.code != 'EEXIST'){
                            console.log(err);
                            return functions.sendBackResponse(res,false,err)
                        }
                    }
                    
                    // check whether the image is not empty
                    if(newSneaker.img != null && newSneaker.img.length){
                        let sneakerImgFile = path.join(sneakerImgDir+IMAGENAME+".jpg")
                        let image = newSneaker.img
                        let bitmap = Buffer.from(image, 'base64')
                        fs.writeFile(sneakerImgFile, bitmap, function(err){
                            if(err) {
                                console.log(err);
                                return functions.sendBackResponse(res,false,err)
                            }
                            newSneaker.img = sneakerImgFile
                            user.data.push(newSneaker)
                            user.save().then(result => {
                                // console.log(result)
                                return functions.sendBackResponse(res,true,result)
                            })
                            .catch(err => {
                                console.log(err);
                                return functions.sendBackResponse(res,false,err)
                            })
                        })
                    } else {
                        user.data.push(newSneaker)
                        user.save().then(result => {
                            // console.log(result)
                            return functions.sendBackResponse(res,true,result)
                        })
                        .catch(err => {
                            console.log(err);
                            return functions.sendBackResponse(res,false,err)
                        })
                    } 

                    
                    
                    

                })
                
            })

            

            
        })
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

    

        User.findOne({ _id: userID, "data.id": sneakerID }, {"data.$": 1})
        .then(sneakerStock => {
            if(sneakerStock == null){
                return functions.sendBackResponse(res,false,"Sneaker Not Existed!!!")
            }
            
            const sneakerResult = sneakerStock.data[0]
            // check whether the image is not empty
            if(sneakerResult.img != null && sneakerResult.img.length){
                let sneakerImgDir = path.dirname(sneakerResult.img.split('//').join("////"))
                // console.log(sneakerImgDir)
                fs.rmdir(sneakerImgDir, { recursive: true}, (err) => {
                    if(err){
                        console.log(err);
                        return functions.sendBackResponse(res,false,err)
                    }
                    
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
                                // console.log(result)
                                functions.sendBackResponse(res,true,result)
                            }
                        }
                    )

                })
            } else {
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
                            // console.log(result)
                            functions.sendBackResponse(res,true,result)
                        }
                    }
                )
            }
        })
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
        
        // User.findOneAndUpdate(
        //     { _id: userID, 
        //       data: { $elemMatch: { id: sneakerID}} 
        //     },
        //     {
        //         $set: { 
        //             "data.$.name": sneaker.name,
        //             "data.$.notes": sneaker.notes,
        //             "data.$.img": sneaker.img,
        //             "data.$.available": sneaker.available,
        //         }
        //     },
        //     function(err, result){
        //         if (err){
        //             console.log(err);
        //             functions.sendBackResponse(res,false,err)
        //         }
        //         else{
        //             console.log(result)
        //             functions.sendBackResponse(res,true,result)
        //         }
        //     }
        // )

        // check whether updated image is available
        if(sneaker.img != null && sneaker.img.length){

            // User.findOne({ _id: userID, data: { $elemMatch: { id: sneakerID}} })
            User.findOne({ _id: userID, "data.id": sneakerID }, {"data.$": 1})
            .then(sneakerStock => {
                if(sneakerStock == null){
                    return functions.sendBackResponse(res,false,"Sneaker Not Existed!!!")
                }
                // console.log(sneakerStock)
                let sneakerResult = sneakerStock.data[0]
                let sneakerImgFile = sneakerResult.img
                let image = sneaker.img
                let bitmap = Buffer.from(image, 'base64')
                // ovewritten image file no matter what
                fs.writeFile(sneakerImgFile, bitmap, function(err){
                    if(err){
                        console.log(err);
                        return functions.sendBackResponse(res,false,err)
                    }

                    User.findOneAndUpdate(
                        { _id: userID, 
                            data: { $elemMatch: { id: sneakerID}} 
                        },
                        {
                            $set: { 
                                "data.$.name": sneaker.name,
                                "data.$.notes": sneaker.notes,
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
                })


            })
                
            
        } else {
            User.findOneAndUpdate(
                { _id: userID, 
                    data: { $elemMatch: { id: sneakerID}} 
                },
                {
                    $set: { 
                        "data.$.name": sneaker.name,
                        "data.$.notes": sneaker.notes,
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
        }

    },
    sendBackResponse: function(res,status,data){
        res.setHeader('Content-Type', 'application/json')
        res.json(JSON.stringify({success: status, msg: data}))
    }
}

module.exports = functions