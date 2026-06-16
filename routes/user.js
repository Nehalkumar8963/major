const express = require('express');
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveReturnTo } = require("../middleware.js");
const usersController = require("../controllers/users.js");


router.get("/signup", usersController.renderSignupForm);

router.post(
    "/signup",
    wrapAsync(usersController.signup)
);

router.get("/login", usersController.renderLoginForm);

router.post(
    "/login",
    saveReturnTo,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    usersController.login
);

router.get("/logout", usersController.logout);

module.exports = router;
