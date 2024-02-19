//<editor-fold desc={"new"}>
const Product = require('../models/product');
const Order = require('../models/order');
const path = require("path");
const fs = require("fs");
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_51O8KsmH3LN9D5uVF5AIgfW0B2vRSQ98vugTLX0fNXVQ5ENuDXaoKA2HUUwqNbG0fll3IXms8tBXdGXQx7gmFjrd100WduSjBVe');
const ITEMS_PER_PAGE = 3;


const getIndex = async (req, res, next) => {
    const page = +req.query.page || 1;
    try {
        const numberOfProducts = await Product.find().countDocuments()
        const products = await Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
        res.render('shop/index', {
            pageTitle: 'Karibu Dukani',
            products: products,
            path: '/',
            isAuthenticated: req.session.isLoggedIn,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < numberOfProducts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(numberOfProducts / ITEMS_PER_PAGE),
        });
    } catch (err) {
        return next(err)
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

const getInvoice = async (req, res, next) => {
    const doc = new PDFDocument();
    try {
        const {orderId} = req.params;
        const order = await Order.findById(orderId);
        //const orders = await Order.find({'user.userId': req.user._id})
        if (!order) {
            return next(Error('No order found.'));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(Error('Unauthorised'));
        }
        const invoice = `invoice-${orderId}.pdf`;
        const invoicePath = path.join('data', 'invoice', invoice);
        // try {
        //     await fs.promises.access(invoicePath);
        // } catch (err) {
        //     return next(Error('Invoice not found'));
        // }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${invoice}`);
        doc.pipe(fs.createWriteStream(invoicePath));
        doc.pipe(res);

        doc.fontSize(26).text('Invoice', {
            underline: true,
            align: 'center'
        });
        doc.text('----------------------------------------');
        let totalPrice = 0;
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price;
            doc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x ${prod.product.price}`);
        });
        doc.text('-----------------------');
        doc.fontSize(20).text(`Total Price: ${totalPrice}`);
        doc.end();

        //}
        // const fileStream = fs.createReadStream(invoicePath);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `inline; filename=${invoice}`);
        // fileStream.pipe(res);
    } catch (err) {
        next(err);
    }
}

const customerCheckout = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId')

        const products = user.cart.items


        res.render('shop/checkout', {
            path: '/checkout',
            pageTitle: 'Checkout',
            products: products,
            isAuthenticated: req.session.isLoggedIn,
            totalSum: products.reduce((acc, item) => {
                return acc + item.quantity * item.productId.price
            }, 0)
        })
    } catch (err) {
        return next(err);
    }
}
//</editor-fold>

const checkoutSession = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId')

        const products = user.cart.items;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: products.map(p => {
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: p.productId.title,
                        },
                        unit_amount: p.productId.price * 100,
                    },
                    quantity: p.quantity
                }
            }),
            mode: 'payment',
            success_url: req.protocol + '://' + req.get('host') + '/success',
            cancel_url: req.protocol + '://' + req.get('host') + '/cancel',
        })
        res.redirect(
            303,
            session.url
        )
    }catch(err){
        return next(err);

    }
}

module.exports = {
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
}