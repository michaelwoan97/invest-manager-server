require('dotenv').config()
const jsonwt = require('jsonwebtoken')
var config = require('../config/dbconfig')
var {User, Sneaker, Stock}= require('../models/user')

let refreshTokens = [] // store refresh token temp

authenticate= function(req,res) {
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
                    const token = generateAccessToken(user.toJSON())
                    const refreshToken = jsonwt.sign(user.toJSON(), process.env.REFRESH_TOKEN_SECRET)
                    refreshTokens.push(refreshToken)
                    res.json({success: true, token: token, refreshToken: refreshToken})
                }
                else 
                {
                    return res.status(403).send({success: false, msg: 'Authentication failed, wrong password'})
                }
            })
        }
    })
}

generateAccessToken = function(user){
    return jsonwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "10m"})
}


refreshToken = function(req, res){
    const refreshToken = req.body.token
    if(refreshToken == null) return res.send({success: false, msg: "Pls include the token"})
    if(!refreshTokens.includes(refreshToken)) return res.send({success: false, msg: "Token is not existed!!!"})
    jsonwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
        if(err) return res.send({success: false, msg: "Cant verify the user!!!"})
        const accessToken = generateAccessToken({name: user.name})
        res.send({success: true, msg: accessToken})
    })
}

logOut = function(req,res) {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.send({success: true, msg: "successfully loged out!!!"})
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
