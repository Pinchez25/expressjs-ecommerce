
const onlyAuthenticatedUsers = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        req.session.redirectTo = req.originalUrl;
        return res.redirect('/auth/login')
    }
    next()
}

module.exports = onlyAuthenticatedUsers;