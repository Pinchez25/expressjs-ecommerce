const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, required: true}
        }]
    }
})

userSchema.methods.addToCart = function (product) {
    const existingProductIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (existingProductIndex >= 0) {
        newQuantity = this.cart.items[existingProductIndex].quantity + 1;
        updatedCartItems[existingProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity,
        });
    }

    this.cart = {
        items: updatedCartItems
    };

    return this.save();
}

userSchema.methods.removeFromCart = function (productId) {
    this.cart.items = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    return this.save();

}

userSchema.methods.clearCart = function () {
    this.cart = {items: []};
    return this.save();
}


module.exports = model('User', userSchema)
