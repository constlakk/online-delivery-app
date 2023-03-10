const express = require('express');
const router = express.Router();

// Get Product model
const Product = require('../models/product');

// Get Order model
const Order = require('../models/order');

/*
 * GET add product to cart
 */
router.get('/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p.image
                });
            }
        }

        req.flash('success', 'Product added!');
        res.redirect('back');
    });

});

/*
 * GET checkout page
 */
router.get('/checkout', function (req, res) {

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }

});

/*
 * GET update product
 */
router.get('/update/:product', function (req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');

});

/*
 * GET clear cart
 */
router.get('/clear', function (req, res) {

    delete req.session.cart;
    
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');

});

/*
 * POST new order
 */
router.post('/neworder', function (req, res) {

    const name = req.body.name;
    const address = req.body.address;
    const num = req.body.unique_products;
    const total_amount = req.body.total_amount_euro;

    let deliverables = [];

    if(num == 1) {
        deliverables.push({name: req.body.item_name, quantity: req.body.quantity, subtotal: req.body.price * req.body.quantity});
    } else {
        for(let i = 0; i < num; i++) {
            deliverables.push({name: req.body.item_name[i], quantity: req.body.quantity[i], subtotal: req.body.price[i] * req.body.quantity[i]});
        }
    }

    let order = new Order({
        name: name,
        address: address,
        deliverables: deliverables,
        total_amount: total_amount
    });

    order.save(function (err) {
        if (err)
            return console.log(err);

        delete req.session.cart;
        req.flash('success', 'Order placed succesfully!');
        res.redirect('/');
    });

});

// Exports
module.exports = router;