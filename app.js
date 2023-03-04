require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const passport = require('passport');
const fetch = require('node-fetch');

//models
const Category = require('./models/category');
const Product = require('./models/product');

//mongoose.connect(config.db_connection_string)
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to database.'))
    .catch(() => console.log('Cannot connect to database'));

//Initialise app
const app = express();

//Setup view engine
const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
app.set('view engine', 'ejs');

//Define public folder
app.use(express.static(path.join(__dirname, 'public')));

//Global errors variable
app.locals.errors = null;

var myHeaders = new fetch.Headers();
myHeaders.append("apikey", "oU2vyxqaZExpE5yOBbLXXCYG83NH3N0x");

var requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: myHeaders
};

global.acceptable_currencies = ["eur", "usd", "gpb"];
global.currency_symbols = { "eur" : "€", "usd" : "$", "gbp" : "£" };
global.currency_rates = { "eur" : 1, "usd" : undefined, "gbp" : undefined };
global.currency_global = "eur";

fetch("https://api.apilayer.com/fixer/convert?to=USD&from=EUR&amount=1", requestOptions)
  .then(response => response.json())
  .then(data => {
    currency_rates["usd"] = data.info.rate;
  })
  .catch(error => console.log('error', error));

fetch("https://api.apilayer.com/fixer/convert?to=GBP&from=EUR&amount=1", requestOptions)
    .then(response => response.json())
    .then(data => {
        currency_rates["gbp"] = data.info.rate;
    })
    .catch(error => console.log('error', error));  

setTimeout(() => {
    console.log("Rates: eur to usd = " + currency_rates["usd"] + ", eur to gbp = " + currency_rates["gbp"]);
}, 3000);


//Body parser middleware
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  }));

//Get categories for menu
Category.find(function (err, categories) {
    if(err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

//Get products for main body
Product.find(function (err, products) {
    if(err) {
        console.log(err);
    } else {
        app.locals.products = products;
    }
});

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

//Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

//routes
const admin_panel = require('./routes/admin_panel');
const home = require('./routes/home');
const categories = require('./routes/categories');
const products = require('./routes/products');
const cart = require('./routes/cart');
const users = require('./routes/users');
const currency = require('./routes/currency');

app.use('/admin', admin_panel);
app.use('/categories', categories);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/currency', currency);
app.use('/', home);

//Initialise server
const port = 3000;
app.listen(port, () => {
    console.log(`Starting server on port ${port}`);
});