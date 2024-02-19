const {body} = require('express-validator')

const validateProduct = [
    body('title', 'Title must be a string and at least 3 characters long')
        .isString()
        .isLength({min:3})
        .trim(),
    body('price')
        .notEmpty().withMessage('Price must not be empty')
        .toFloat()
        .isFloat({min:0.01}).withMessage('Price must be a number and greater than 0.01'),
    body('description','Description must be between 5 and 400 characters long')
        .trim()
        .isLength({min:5, max:400})
        .escape()


]

module.exports = {validateProduct}