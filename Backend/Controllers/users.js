const User = require('../Models/users')


async function handleUserSignUp(req,res){
    const {name,email ,password} = req.body
    if(!(email&&password))
    {
        res.status(400).json({msg:"Bad request"})
    }
    //  Pending : Validation of email

    //creating user 
    await User.create({
        name,
        email,
        password
    })
    res.status(201).json({msg:`${name} user created`})
}
async function handleUserFetch(req,res){
    const allUser = await User.find({})
    if(!allUser){
        res.status(404).json({msg:"users not found"})
    }
    res.status(200).json({allUser})
}

module.exports = { handleUserSignUp, handleUserFetch };