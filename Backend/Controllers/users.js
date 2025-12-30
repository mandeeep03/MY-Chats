const User = require('../Models/users')

async function handleUserSignUp(req,res){
    const {name,email ,password} = req.body
    //  Pending : Validation of email

    //creating user 
    await User.create({
        name,
        email,
        password
    })
    
}