const express = require('express')

const {
    getIndex,
    getProducts,
    getProductDetails,
    addToCart,
    getUserCart,
    removeFromCart,
    createOrder,
    getOrders

} = require('../controllers/shop')

const isAuthenticated = require('../middleware/is-authenticated')

const router = express.Router()

router.get('/', getIndex)
router.get('/products', getProducts)
router.get('/product/:productId', getProductDetails)
router.get('/cart', isAuthenticated, getUserCart)
router.post('/cart', isAuthenticated, addToCart)
router.post('/create-order', isAuthenticated, createOrder)
// router.get('/checkout', customerCheckout)
router.get('/orders', isAuthenticated, getOrders)
router.post('/delete-cart-product', isAuthenticated, removeFromCart)
module.exports = router