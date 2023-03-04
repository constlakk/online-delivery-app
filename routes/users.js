const express = require('express');
const router = express.Router();
const passport = require('passport');

/*
 * GET login
 */
router.get('/login', function (req, res) {

    if (res.locals.user) res.redirect('/');
    
    res.render('login', {
        title: 'Login'
    });

});

/*
 * POST login
 */
router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    
});

/*
 * GET logout
 */
router.get('/logout', function (req, res) {

    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Logged out successfully.');
        res.redirect('/users/login');
    });

});

// Exports
module.exports = router;