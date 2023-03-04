const express = require('express');
const router = express.Router();

router.get('/:currency', function(req, res){

    const currency = req.params.currency.toLowerCase();

    if(!acceptable_currencies.includes(currency)) {
        res.redirect('back');
    }
    
    console.log(currency_global);
    currency_global = req.params.currency.toLowerCase();
    console.log(currency_global);

    res.redirect('back');

});

module.exports = router;