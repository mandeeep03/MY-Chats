const express =  require('express')
const { handleUserSignUp, handleUserFetch } = require("../Controllers/users");
const router = express.Router()

router
    .route('/signup')
    .post(handleUserSignUp)

router.route("/").get(handleUserFetch);

module.exports = router