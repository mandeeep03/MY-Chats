const User = require('../Models/users')
const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validateEmailAndPass(email,pass,req,res){
    if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: "Email must be @gmail.com" });
    }

    if (!passwordRegex.test(pass)) {
        return res.status(400).json({
        msg: "Password must be 8+ chars with uppercase, lowercase, and number",
        });
    }
}

async function handleUserSignUp(req,res){
    const {name,email ,password} = req.body
    if(!(email&&password))
    {
        return res.status(400).json({msg:"Bad request"})
    }
    //Validation of email & Password
    validateEmailAndPass(email,password,req,res)

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
    // Validation of email and pass
    validateEmailAndPass(email, password,req,res);

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