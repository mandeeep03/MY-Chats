const express =  require('express')
const { handleUserSignUp, handleUserFetch, handleUserLogin } = require("../Controllers/users");
const router = express.Router()

router.post('/signup',handleUserSignUp)
router.post("/login", handleUserLogin);



router.route("/").get(handleUserFetch);

module.exports = router