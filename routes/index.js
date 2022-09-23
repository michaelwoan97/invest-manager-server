const express = require('express')
const actions = require('../methods/actions')
const authenticate = require('../controllers/authenticate')
const router = express.Router()

// middleware
router.use("/getdata/", authenticate.authenticateToken)
router.use("/updatedata/", authenticate.authenticateToken)

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
// router.post('/authenticate', actions.authenticate)

//@desc add a new sneaker to user document
//@Route POST /updatedata/addsneaker
router.post('/updatedata/addsneaker', actions.addNewSneaker)

//@desc remove sneakers from user document
//@Route POST /updatedata/removesneaker
router.post('/updatedata/removesneaker', actions.removeSneaker)

//@desc add new stock from a sneaker list of user document
//@Route POST /updatedata/addstock
router.post('/updatedata/addstock', actions.addNewStock)

//@desc remove stock from a sneaker list of user document
//@Route POST /updatedata/removestock
router.post('/updatedata/removestock', actions.removeStock)

//@desc update sneaker from the sneaker list of user document
//@Route POST /updatedata/updatesneaker
router.post('/updatedata/updatesneaker', actions.updateSneaker)

//@desc get info of the authenticated user
//@route GET /getdata/info
router.get('/getdata/info', actions.getInfo)

//@desc get sneaker data of the authenticated user
//@route GET /getdata/sneake
router.get('/getdata/sneaker', actions.getSneakerData)

module.exports = router

