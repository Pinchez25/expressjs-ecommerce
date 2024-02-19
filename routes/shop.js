const express = require('express')

const {
    getIndex,
    getProducts,
    getProductDetails,
    addToCart,
    getUserCart,
    removeFromCart,
    createOrder,
    getOrders,
    getInvoice,
    customerCheckout,
    checkoutSession
    // postCheckout

} = require('../controllers/shop')


const isAuthenticated = require('../middleware/is-authenticated')

const router = express.Router()

router.get('/', getIndex)
router.get('/products', getProducts)
router.get('/product/:productId', getProductDetails)
router.get('/cart', isAuthenticated, getUserCart)
router.post('/cart', isAuthenticated, addToCart)
router.post('/create-order', isAuthenticated, createOrder)
router.get('/checkout', customerCheckout)
router.post('/create-checkout-session', isAuthenticated, checkoutSession)
router.get('/orders', isAuthenticated, getOrders)
router.post('/delete-cart-product', isAuthenticated, removeFromCart)
router.get('/orders/:orderId', isAuthenticated, getInvoice);
router.get('/success', (req, res) => {
    res.render('shop/success', {})
})
router.get('/cancel', (req, res) => {
    res.render('shop/cancel')
})
module.exports = router