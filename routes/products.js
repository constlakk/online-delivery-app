const express = require('express');
const router = express.Router();
// const fs = require('fs-extra');
//const auth = require('../config/auth');
//const isUser = auth.isUser;

// Get Product model
const Product = require('../models/product');

// Get Category model
const Category = require('../models/category');

/*
 * GET all products
 */
router.get('/', function (req, res) {
    
    Product.find(function (err, products) {
        if (err)
            console.log(err);

        res.render('products', {
            title: 'All products',
            products: products
        });
    });

});


/*
 * GET products by category
 */
router.get('/:category', function (req, res) {

    const categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, function (err, category) {
        Product.find({category: categorySlug}, function (err, products) {
            if (err)
                console.log(err);

            res.render('category_products', {
                title: category.title,
                products: products
            });
        });
    });

 });

/*
 * GET product details
 */
router.get('/:category/:product', function (req, res) {

    Product.findOne({slug: req.params.product}, function (err, product) {
            if (err) {
                console.log(err);
            } else {
                res.render('product', {
                    title: product.title,
                    product: product
                });                
            }
        });

});

// Exports
module.exports = router;