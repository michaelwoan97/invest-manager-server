const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const connectDB = require('./config/db')
const passport = require('passport')
const bodyParser = require('body-parser')
const routes = require('./routes/index')
const fs = require('fs')
const path = require('path')

connectDB()

const app = express();

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use(cors())
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

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

