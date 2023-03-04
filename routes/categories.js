const express = require('express');
const router = express.Router();

const Category = require('../models/category');

router.get('/', function(req, res){
    Category.find(function(err, categories){
        if (err) {
            return console.log(err);
        }
        res.render('categories', {
            categories: categories
        });
    });
});

module.exports = router;