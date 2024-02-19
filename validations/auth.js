const {check, body} = require("express-validator");
const User = require("../models/user");

const validateRegistration = [
    check("username").custom(async (value) => {
        const userExists = await User.findOne({username: value});
        if (userExists) {
            throw new Error("User already exists");
        }
    }).trim(),
    check("email")
        .isEmail()
        .withMessage("Enter a valid email")
        .custom(async (value) => {
            const userDoc = await User.findOne({email: value});

            if (userDoc) {
                throw new Error("Email already exists");
            }
        })
        .normalizeEmail(),
    body(
        "password",
        "Password must be alphanumeric and at least 6 characters long"
    )
        .isLength({min: 6})
        .isAlphanumeric()
        .trim(),
    body("confirmPassword", "Password mismatch").custom((value, {req}) => {
        return value === req.body.password;
    }).trim(),
];

const validateLogin = [
    body("email")
        .isEmail()
        .withMessage("Enter a valid email")
        .custom(async (value) => {
            const userDoc = await User.findOne({email: value});

            if (!userDoc) {
                throw new Error("Invalid email and/or password");
            }
        }
        )
        .normalizeEmail(),
];


module.exports = {validateRegistration, validateLogin};