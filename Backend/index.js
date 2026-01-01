const express = require('express')
const { connectMongoDB } = require("./connect");
const userRouter = require('./Router/users')
require('dotenv').config()
const cors = require('cors')
const app = express()

//Puts data in body 
app.use(express.urlencoded({extended:true}))


//Connecting database 
connectMongoDB(process.env.MONGODB_URI)
    .then(()=>{
    console.log("Databse Connected Succesfully")
})
    .catch((err)=>{
    console.log("Error for database is " + err)
})

app.use('/users',userRouter)

//starting server
app.listen(process.env.PORT,()=>{
    console.log(`server listining on http://localhost:${process.env.PORT}`)
})