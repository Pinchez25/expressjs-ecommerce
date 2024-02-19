const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/emails');
const {validationResult} = require('express-validator')

const getUserLogin = async (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/')
    }
    try {
        res.render('auth/login', {
            pageTitle: "Login",
            path: '/auth/login',
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: null,
            errorMessages: [],
            oldInput: {
                email: "",
                password: "",
            }
        })
    } catch (err) {
        console.error(err);
    }
}
const userLogin = async (req, res) => {
    const {email, password} = req.body;
    const redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
    delete req.session.redirectTo;

    try {
        const user = await User.findOne({email: email})
        if (!user) {
            // req.flash('error', 'Invalid email and/or password')
            return res.render('auth/login', {
                pageTitle: "Login",
                path: '/auth/login',
                isAuthenticated: req.session.isLoggedIn,
                errorMessage: 'Invalid email and/or password',
                errorMessages: [],
                oldInput: {
                    email: email,
                    password: password,
                }
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // req.flash('error', 'Invalid email and/or password')
            return res.render('auth/login', {
                pageTitle: "Login",
                path: '/auth/login',
                isAuthenticated: req.session.isLoggedIn,
                errorMessage: 'Invalid email and/or password',
                errorMessages: [],
                oldInput: {
                    email: email,
                    password: password,
                }
            })
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {
            res.redirect(redirectTo)
            console.error(err);
        })


    } catch (err) {
        console.error(err);
    }

}
const userLogout = async (req, res) => {
    // res.cookie('loggedIn', false);
    req.session.destroy(err => {
        console.error(err);
        res.redirect('/auth/login')
    })
}

const getUserRegistration = (req, res) => {
    let messages = req.flash('error')

    if (messages.length <= 0) {
        messages = null;
    }

    res.render('auth/register', {
        pageTitle: "Register",
        path: '/auth/register',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: messages,
        oldInput: {email: "", password: "", username: "", confirmPassword: ""}

    })
}

const registerUser = async (req, res) => {
    const {username, email, password, confirmPassword} = req.body;
    const result = validationResult(req);
    console.log(result)
    if (!result.isEmpty()) {
        return res.status(422).render('auth/register', {
            pageTitle: "Register",
            path: '/auth/register',
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: result.array(),
            oldInput: {email: email, password: password, username: username, confirmPassword: confirmPassword}

        })
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
            cart: {items: []}
        })
        const emailContent = `
                   <h1>Registration Successful. </h1>
                   <p>Thank you for choosing us</p>
                  `
        await sendEmail(email, "Registration Successful", emailContent)

        req.session.isLoggedIn = true;
        req.session.user = newUser;
        req.session.save(err => {
            if (err) console.error(err);
            res.redirect('/')
        })
    } catch (e) {
        console.error(e)
    }
}

const getPasswordResetSent = (req, res) => {
    res.render('auth/password-reset-sent', {
        pageTitle: "Password Reset Sent",
        path: '/auth/password-reset-sent/',
        isAuthenticated: req.session.isLoggedIn,
    })
}

const resetPassword = async (req, res) => {
    const {email} = req.body;
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                console.error(err);
                return res.redirect('/auth/reset-password')
            }
            const token = buffer.toString('hex');
            const user = await User.findOne({email: email})
            if (!user) {
                req.flash('error', 'No account with that email found')
                return res.redirect('/auth/reset-password')
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            await user.save()

            let password_reset_message = `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:8000/auth/reset-password/${token}">link</a> to set a new password</p>
            `
            await sendEmail(email, 'Password Reset', password_reset_message)
            res.redirect('/auth/password-reset-sent')
        })

    } catch (e) {
        console.error(e)
    }

}
const getResetPassword = async (req, res) => {
    let messages = req.flash('error')
    if (messages.length <= 0) {
        messages = null;
    }
    res.render('auth/reset', {
        path: '/auth/reset-password/',
        pageTitle: 'Reset Password',
        errorMessage: messages,
        isAuthenticated: req.session.isLoggedIn,
    })

}

const getNewPassword = async (req, res) => {
    const token = req.params['token'];

    let messages = req.flash('error')
    if (messages.length <= 0) {
        messages = null;
    }

    const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})

    if (!user) {
        req.flash('error', 'Invalid token')
        return res.redirect('/auth/reset-password')
    }
    res.render('auth/new-password', {
        path: '/auth/new-password/',
        pageTitle: "Enter a new Password",
        isAuthenticated: req.session.isLoggedIn,
        userId: user._id.toString(),
        errorMessage: messages,
        passwordToken: token,
    })
}
const postNewPassword = async (req, res) => {
    const {password, userId, passwordToken} = req.body;
    try {
        const user = await User.findOne({
            _id: userId,
            resetToken: passwordToken,
            resetTokenExpiration: {$gt: Date.now()}
        })
        if (user) {
            user.password = await bcrypt.hash(password, 12);
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('error', 'Invalid token')
            console.log("Invalid token")
        }
    } catch (e) {
        console.error(e)
    }
}

module.exports = {
    getUserLogin,
    userLogin,
    userLogout,
    getUserRegistration,
    registerUser,
    getResetPassword,
    resetPassword,
    getNewPassword,
    postNewPassword,
    getPasswordResetSent
}