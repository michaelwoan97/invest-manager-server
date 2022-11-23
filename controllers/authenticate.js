require('dotenv').config()
const jsonwt = require('jsonwebtoken')
var config = require('../config/dbconfig')
const { sendBackResponse } = require('../methods/actions')
const RefreshTokenModel = require("../models/RefreshTokenModel")
var {User, Sneaker, Stock}= require('../models/user')

let refreshTokens = [] // store refresh token temp

authenticate= function(req,res) {
    // console.log(req.body)
    User.findOne({
        name: req.body.name
    }, function(err, user){
        
        if(err) throw err
        if(!user){
            
            res.status(403)
            sendBackResponse(res,false,'Authentication Failed, User not found')
        }
        else 
        {
            user.comparePassword(req.body.password, function(err, isMatch){
                if(isMatch && !err){
                    // console.log(user)
                    const payload = { "userID": user._id, "name": user.name, "password": user.password }
                    // console.log(user.toJSON())
                    const token = generateAccessToken(payload)
                    const refreshToken = jsonwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "1d"})
                    // console.log(token)
                    // console.log(refreshToken)

                    // add refresh token to database
                    const newRefreshToken = new RefreshTokenModel({
                        token: refreshToken,
                        user: user._id
                    })
                    
                    RefreshTokenModel.findOneAndUpdate({user: user._id},{token: refreshToken}, {upsert: true}, function(err,result){
                        if(err){ // not existed
                            console.log(err)  
                            return sendBackResponse(res,false,err.message)
                        }
                    })
                    
                    
                    res.setHeader('Content-Type', 'application/json')
                    res.json(JSON.stringify({success: true, token: token, refreshToken: refreshToken, userID: user._id}))
                }
                else 
                {
                    res.status(403)
                    return sendBackResponse(res,false,'Authentication failed, wrong password')
                }
            })
        }
    })
}

generateAccessToken = function(user){
    return jsonwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"})
}


refreshToken = function(req, res){
    if(!req.body.userID || !req.body.userID.length){
        return sendBackResponse(res,false,"Please include userID")
    }

    const userID = req.body.userID
    RefreshTokenModel.findOne({user: userID}, function(err,result){
        if (err){
            console.log(err);
            sendBackResponse(res,false,err.message)
        }
        else{
            const refreshToken = result.token
            console.log(refreshToken)
            jsonwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
                if(err) return res.send({success: false, msg: "Cant verify the user!!!"})
                console.log(user);
                const accessToken = generateAccessToken({name: user.name, data: user.data})
                sendBackResponse(res,true,accessToken)
                // console.log(accessToken);
                // res.json({success: true, msg: accessToken})
            })
        }
    })

    
    
}

logOut = function(req,res) {
    if(!req.body.userID || !req.body.userID.length){
        return sendBackResponse(res,false,"Please include userID")
    }

    RefreshTokenModel.findOneAndDelete({user: req.body.userID}, function(err, result) {
        if(err){
            return sendBackResponse(res,false,'Failed to delete refresh token!!!')
        } else {
            sendBackResponse(res,true,"successfully loged out!!!")
        }
    })
    
}

authenticateToken = function(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
   
    if(token == null) return res.sendStatus(401)

    jsonwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            console.log(err.message)
            return res.sendStatus(403)}
        req.user = user
        // console.log(refreshTokens)
        next()
    })
}


module.exports = {
    authenticate,
    generateAccessToken,
    refreshToken,
    logOut,
    authenticateToken
}
