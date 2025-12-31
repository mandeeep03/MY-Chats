const express = require('express')
const { connectMongoDB } = require("./connect");
const userRouter = require('./Router/users')
const app = express()

//Puts data in body 
app.use(express.urlencoded({extended:true}))

//Connecting database 
connectMongoDB("mongodb://127.0.0.1:27017/my-chat-db").then(()=>{
    console.log("Databse Connected Succesfully")
}).catch((err)=>{
    console.log("Error for database is " + err)
})

app.use('/users',userRouter)

//starting server
app.listen('8000',()=>{
    console.log(`server listining on http://localhost:8000`)
})