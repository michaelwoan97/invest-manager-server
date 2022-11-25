require('dotenv').config()

module.exports = {
    secret: process.env.MONGO_SECRETS,
    database: process.env.MONGO_URI
}