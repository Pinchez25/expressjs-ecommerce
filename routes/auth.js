const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user");

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
router.post(
  "/login",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  body("password", "Password has to be valid.")
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim(),
  userLogin
);
router.post("/logout", userLogout);
router.get("/register", getUserRegistration);
router.post(
  "/register",
  check("username").custom(async (value) => {
    const userExists = await User.findOne({ username: value });
    if (userExists) {
      throw new Error("User already exists");
    }
  }),
  check("email")
    .isEmail()
    .withMessage("Enter a valid email")
    .custom(async (value) => {
      const userDoc = await User.findOne({ email: value });

      if (userDoc) {
        throw new Error("Email already exists");
      }
    }),
  body(
    "password",
    "Password must be alphanumeric and at least 6 characters long"
  )
    .isLength({ min: 6 })
    .isAlphanumeric(),
  body("confirmPassword", "Password mismatch").custom((value, { req }) => {
    return value === req.body.password;
  }),
  registerUser
);
router.get("/reset-password", getResetPassword);
router.post("/reset-password", resetPassword);
router.get("/reset-password/:token", getNewPassword);
router.post("/new-password", postNewPassword);
router.get("/password-reset-sent", getPasswordResetSent);

module.exports = router;
