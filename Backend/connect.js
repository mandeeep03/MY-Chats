const mongoose = require('mongoose')

async function connectMongoDB(url){
    await mongoose.connect('mongodb://127.0.0.1:27017/')
}
module.exports = {connectMongoDB}
