const express = require('express')
const actions = require('../methods/actions')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Hello World')
})

router.get('/dashboard', (req, res) => {
    res.send('Dashboard')
})

//@desc Adding new user
//@route POST /adduser
router.post('/adduser', actions.addNew)

//@desc Authenticate a user
//@Route POST /authenticate
router.post('/authenticate', actions.authenticate)

//@desc get info of the authenticated user
//@route GET /getInfo
router.get('/getinfo', actions.getInfo)

module.exports = router

