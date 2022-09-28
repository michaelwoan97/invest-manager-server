require('dotenv').config()
const jsonwt = require('jsonwebtoken')
var config = require('../config/dbconfig')
const { sendBackResponse } = require('../methods/actions')
var {User, Sneaker, Stock}= require('../models/user')

let refreshTokens = [] // store refresh token temp

authenticate= function(req,res) {
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
                    const token = generateAccessToken(user.toJSON())
                    const refreshToken = jsonwt.sign(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, {expiresIn: "1d"})
                    refreshTokens.push(refreshToken)
                    res.setHeader('Content-Type', 'application/json')
                    res.json(JSON.stringify({success: true, token: token, refreshToken: refreshToken}))
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
    return jsonwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "20s"})
}


refreshToken = function(req, res){
    const refreshToken = req.body.token
    if(refreshToken == null) return res.send({success: false, msg: "Pls include the token"})
    if(!refreshTokens.includes(refreshToken)) return res.send({success: false, msg: "Token is not existed!!!"})
    jsonwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
        if(err) return res.send({success: false, msg: "Cant verify the user!!!"})
        const accessToken = generateAccessToken({name: user.name})
        sendBackResponse(res,true,accessToken)
    })
}

logOut = function(req,res) {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    sendBackResponse(res,true,"successfully loged out!!!")
}

authenticateToken = function(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(token == null) return res.sendStatus(401)

    jsonwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user
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
