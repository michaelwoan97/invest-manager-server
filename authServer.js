const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const authenticate = require('./controllers/authenticate')
const connectDB = require('./config/db')
const bodyParser = require('body-parser')

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

//@desc Authenticate a user
//@Route POST /authenticate
app.post('/authenticate', authenticate.authenticate)

//@desc Referesh token of user when access token expired
//@Route POST /refreshToken
app.post('/token', authenticate.refreshToken)

//@desc delete refresh token of user when log out
//@Route DELETE /logout
app.delete('/logout', authenticate.logOut)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Auth Server is listening on port ${PORT}`));

