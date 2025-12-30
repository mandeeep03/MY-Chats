const express =  require('express')
const { handleUserSignUp } = require('../Controllers/users')
const router = express.Router()

router.post('/',handleUserSignUp)


module.exports = router