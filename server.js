require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const passport = require('passport')
const bodyParser = require('body-parser')
const routes = require('./routes/index')
const fs = require('fs')
const path = require('path')
const helmet = require('helmet')

connectDB()

const app = express();

// middlewares
app.use(cors())
app.use(helmet())

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(routes)
app.use(passport.initialize())
require('./config/passport')(passport)

// check whether the folder for storing sneaker images from users are existed
const APPIMAGEDIR = path.join(__dirname+"/users-sneaker-images/")
if(!fs.existsSync(APPIMAGEDIR)){
    fs.mkdirSync(APPIMAGEDIR)
}

const PORT = process.env.SERVER_PORT

module.exports = app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

