const Product = require('../models/product');
const {validationResult} = require('express-validator');
const deleteFile = require('../utils/file');

const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find({userId: req.user._id});
        res.render('admin/products', {
            products: products,
            pageTitle: "Admin Products",
            path: '/admin-products',
            isAuthenticated: req.session.isLoggedIn,
        });
    } catch (err) {
        console.error(err);
    }
};

const getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        pageTitle: "Add a new product",
        path: "/add-product",
        editing: false,
        isAuthenticated: req.session.isLoggedIn,
        hasError: false,
        errorMessage: null,
    });
};

const addNewProduct = async (req, res) => {
    try {
        const {title, price, description} = req.body;
        const image = req.file;
        const errors = validationResult(req);

        if (!image) {
            return res.status(422).render('admin/edit-product', {
                pageTitle: "Add a new product",
                path: "/add-product",
                editing: false,
                hasError: true,
                isAuthenticated: req.session.isLoggedIn,
                errorMessage: [{msg: 'Attached file is not an image'},],
                product: {title, price, description},
                oldInput: {title, price, description}
            });
        }


        if (!errors.isEmpty()) {
            return res.status(422).render('admin/edit-product', {
                pageTitle: "Add a new product",
                path: "/add-product",
                editing: false,
                hasError: true,
                isAuthenticated: req.session.isLoggedIn,
                errorMessage: errors.array(),
                product: {title, image, price, description},
                oldInput: {title, image, price, description}
            });
        }
        await Product.create({
            title,
            price,
            description,
            image: image.path,
            userId: req.user,
        });
        res.redirect('/products');
    } catch (err) {
        console.log(err);
    }
};

const postEditProduct = async (req, res) => {
    try {
        const {product_id, title, price, description} = req.body;
        const image = req.file;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: "/edit-product",
                editing: true,
                hasError: true,
                isAuthenticated: req.session.isLoggedIn,
                errorMessage: errors.array(),
                product: {title, price, description, _id: product_id},
                oldInput: {title, price, description}
            });
        }

        //only update image if a new image is uploaded
        const product = await Product.findById(product_id);
        if (image) {
            deleteFile(product.image);
            product.image = image.path;
        }
        product.title = title;
        product.price = price;
        product.description = description;
        await product.save();

        // await Product.findByIdAndUpdate(product_id, {
        //     title,
        //     price,
        //     description,
        //     image: image.path? image,
        // })
        res.redirect('/admin-products');
    } catch (err) {
        console.error(err);
    }
};

const getEditProduct = async (req, res) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    res.render('admin/edit-product', {
        pageTitle: "Edit Product",
        path: "/edit-product",
        editing: true,
        hasError: false,
        product,
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: null,
    });
};

const deleteProduct = async (req, res) => {
    const productId = req.params.productId;
    try {
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        await deleteFile(product.image);
        res.status(200).json({message: 'Success'});
    } catch (e) {
        res.status(500).json({message: 'Deleting product failed'});
        // res.status(500).send("Internal server error");
    }
};

module.exports = {
    addNewProduct,
    getAddProduct,
    getEditProduct,
    postEditProduct,
    getAdminProducts,
    deleteProduct
};