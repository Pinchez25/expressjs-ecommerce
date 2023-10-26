const Product = require('../models/product')

const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find({userId:req.user._id})//.select('title price -_id').populate('userId');
        // console.log(products)
        res.render('admin/products', {
            products: products,
            pageTitle: "Admin Products",
            path: '/admin-products',
            isAuthenticated: req.session.isLoggedIn,
            
        });
    } catch (err) {
        console.error(err);
    }
}


const getAddProduct = (req, res) => {
    
    res.render('admin/edit-product', {
        pageTitle: "Add a new product",
        path: "/add-product", editing: false,
        isAuthenticated: req.session.isLoggedIn,
        
    })
}
const addNewProduct = async (req, res) => {
    try {
        const {title, image, price, description} = req.body;
        await Product.create({
            title: title,
            price: price,
            description: description,
            image: image,
            userId: req.user,
        })
        res.redirect('/products');
    } catch (err) {
        console.log(err);
    }
};

const postEditProduct = async (req, res) => {
    try {
        const {product_id, title, image, price, description} = req.body;
        await Product.findByIdAndUpdate(product_id, {
            title: title,
            image: image,
            price: price,
            description: description
        })
        res.redirect('/admin-products')
    } catch (err) {
        console.error(err);
    }

}
const getEditProduct = async (req, res) => {
    const productId = req.params['productId'];
    const product = await Product.findById(productId);
    res.render('admin/edit-product', {
        pageTitle: "Edit Product",
        path: "/edit-product",
        editing: true,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        
    })
}

const deleteProduct = async (req, res) => {
    const {productId} = req.body;
    try {
        await Product.findByIdAndDelete(productId);
        res.redirect('/admin-products');
    } catch (err) {
        console.error(err);
    }

}

module.exports = {addNewProduct, getAddProduct, getEditProduct, postEditProduct, getAdminProducts, deleteProduct}