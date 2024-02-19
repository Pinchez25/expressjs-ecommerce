const express = require("express");
const {validateRegistration} = require('../validations/auth')
const {
    userLogin,
    getUserLogin,
    userLogout,
    getUserRegistration,
    registerUser,
    getResetPassword,
    resetPassword,
    getNewPassword,
    postNewPassword,
    getPasswordResetSent,
} = require("../controllers/auth");

const router = express.Router();

router.get("/login", getUserLogin);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.get("/register", getUserRegistration);
router.post("/register", validateRegistration, registerUser);
router.get("/reset-password", getResetPassword);
router.post("/reset-password", resetPassword);
router.get("/reset-password/:token", getNewPassword);
router.post("/new-password", postNewPassword);
router.get("/password-reset-sent", getPasswordResetSent);

module.exports = router;
