// a mongoose schema for a user with a cart
const mongoose = require('mongoose');
const crypto = require('crypto');
const {join} = require("path");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'user'
    },
    password: {
        type: String,
        required: true
    },
    image:{
        type:String,
        default:''
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);
    return resetToken;
}

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.products.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartProducts = [...this.cart.products];
}

// delete associated image when user is deleted
userSchema.pre('remove', async function (next) {
    if (this.image) {
        const imagePath = join(__dirname, '..', '..', 'uploads', this.image);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
            })
        }
    }
    next();
});

// isAdmin middlware
userSchema.methods.isAdmin = function () {
    return this.role === 'admin';
}

//isModerator middleware
userSchema.methods.isModerator = function () {
    return this.role === 'moderator';
}

const adminRequired = (req, res, next) => {
    if (req.user.isAdmin()) {
        next();
    } else {
        res.status(401).json({
            message: 'You are not authorized to perform this action'
        });
    }

}

const moderatorRequired = (req, res, next) => {
    if (req.user.isModerator()) {
        next();
    } else {
        res.status(401).json({
            message: 'You are not authorized to perform this action'
        });
    }
}


module.exports = mongoose.model('User', userSchema);
