const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session")
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash')

const shopRouter = require('./routes/shop');
const {adminRoutes} = require('./routes/admin');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/duka',
    collection: 'sessions',
}, error => {
    if (error) console.log(error)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: 'the best coder', resave: false, saveUninitialized: false, store: store}))
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(async (req, res, next) => {
    try {
        if (!req.session.user) {
            return next()
        }
        req.user = await User.findById(req.session.user._id)
        next()
    } catch (err){
        console.log(err)
    }

})

// app.use((req, res, next)=>{
//     req.isLoggedIn = req.cookies['loggedIn'] === 'true';
//     next()
// })


app.use(adminRoutes);
app.use(shopRouter);
app.use('/auth', authRoutes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {
        pageTitle: 'Page Not Found',
        path: '',
        isAuthenticated: req.isLoggedIn,

    });
});

module.exports = app;
