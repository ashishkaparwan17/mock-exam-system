const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const userRoutes = require('./routes/user-route')
const testRoutes = require('./routes/test-route')

dotenv.config({path: './config.env'})
const server = express()

server.use(cors())
server.use(express.json())

server.use(userRoutes)
server.use(testRoutes)

mongoose.connect(
    process.env.MONGODB_CONNECTION_URL
).then(() => {
    server.listen(process.env.PORT || 5001)
}).catch((err) => {
    console.log("unable to connect to server: " + err)
})