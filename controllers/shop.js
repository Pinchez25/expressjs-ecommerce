const Product = require('../models/product');
const Order = require('../models/order');

const getIndex = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('shop/index', {
            pageTitle: 'Karibu Dukani',
            products: products,
            path: '/',
            isAuthenticated: req.session.isLoggedIn,
            
        });
    } catch (err) {
        console.error(err);
    }
}


const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('shop/products-list', {
            products: products,
            pageTitle: "All Products",
            path: '/products',
            isAuthenticated: req.session.isLoggedIn,
            
        });
    } catch (err) {
        console.error(err);
    }
}

const getProductDetails = async (req, res) => {
    try {
        const product_id = req.params['productId'];
        const product = await Product.findById(product_id);
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: `/product/${product_id}`,
            isAuthenticated: req.session.isLoggedIn,
            
        });
    } catch (err) {
        console.error(err);
    }
}

const getUserCart = async (req, res) => {
    // console.log(req.user)
    try {
        const user = await req.user.populate('cart.items.productId')
        // console.log(user.cart.items)
        const products = user.cart.items
        res.render('shop/cart', {
            pageTitle: "Your Cart",
            path: '/cart',
            products: products,
            isAuthenticated: req.session.isLoggedIn,
            
        })
    } catch (err) {
        console.error(err);
    }
}
const addToCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const product = await Product.findById(productId)
        await req.user.addToCart(product)
        res.redirect('/cart')
    } catch (err) {
        console.error(err);
    }
}
const removeFromCart = async (req, res) => {
    try {
        const {productId} = req.body;
        await req.user.removeFromCart(productId)
        res.redirect('/cart')
    } catch (err) {
        console.error(err)
    }
}

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({'user.userId': req.user._id})
        res.render('shop/orders', {
            pageTitle: "Your Orders",
            path: '/orders',
            orders: orders,
            isAuthenticated: req.session.isLoggedIn,
            
        })
    } catch (err) {
        console.error(err);
    }
}

const createOrder = async (req, res) => {
    try {
        const user = await req.user.populate('cart.items.productId')
        const products = user.cart.items.map(item => {
            return {quantity: item.quantity, product: {...item.productId}}
        })

        await Order.create({
            user: {
                name: req.user.username,
                userId: req.user
            },
            products: products
        })
        await req.user.clearCart()
        res.redirect('/orders')

    } catch (err) {
        console.error(err);
    }
}

module.exports = {getIndex, getProducts, getProductDetails, addToCart, getUserCart, removeFromCart, createOrder, getOrders}