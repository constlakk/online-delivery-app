const express = require('express');
const router = express.Router();

const Order = require('../models/order');

/*
 * GET all orders
 */
router.get('/', function (req, res) {

    if (!res.locals.user) res.redirect('/');

    Order.find(function (err, orders) {
        if (err)
            console.log(err);

        res.render('admin_panel', {
            title: 'Admin Panel',
            orders: orders
        });
    }); 
});

module.exports = router;