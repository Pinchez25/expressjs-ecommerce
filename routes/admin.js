const express = require('express')
const onlyAuthenticatedUsers = require('../middleware/is-authenticated')

const {
    addNewProduct,
    getAddProduct,
    getEditProduct,
    postEditProduct,
    getAdminProducts,
    deleteProduct,
} = require('../controllers/admin')

const router = express.Router()

router.get('/add-product', onlyAuthenticatedUsers, getAddProduct)

router.post('/product', onlyAuthenticatedUsers, addNewProduct)

router.get('/admin-products', onlyAuthenticatedUsers, getAdminProducts)

router.get('/edit-product/:productId', onlyAuthenticatedUsers, getEditProduct)

router.post('/edit-product', onlyAuthenticatedUsers, postEditProduct)

router.post('/delete-product', onlyAuthenticatedUsers, deleteProduct)


module.exports = {adminRoutes: router}