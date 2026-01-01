const User = require('../Models/users')


async function handleUserSignUp(req,res){
    const {name,email ,password} = req.body
    if(!(email&&password))
    {
        return res.status(400).json({msg:"Bad request"})
    }
    //  Pending : Validation of email

    //creating user 
    await User.create({
        name,
        email,
        password
    })
    return res.status(201).json({msg:`${name} user created`})
}
async function handleUserLogin(req,res){
    const {email,password } = req.body
    if(!email||!password){
        return res.status(400).json({msg:"incomplete data"})
    }
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({msg:"Not found"})
    }
    const isMatch = password === user.password
    if(!isMatch){
        return res.status(401).json({msg:"Invalid Credintals"})
    }
    return res.status(200).json({msg:"User Logined",user})
}
async function handleUserFetch(req,res){
    const allUser = await User.find({})
    if(!allUser){
        res.status(404).json({msg:"users not found"})
    }
    res.status(200).json({allUser})
}

module.exports = { handleUserSignUp, handleUserFetch, handleUserLogin };