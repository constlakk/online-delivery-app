const mongoose = require('mongoose');

// Order Schema
const OrderSchema = mongoose.Schema({
   
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    deliverables: [],
    total_amount: {
        type: Number,
        required: true
    }
    
});

const Order = module.exports = mongoose.model('Order', OrderSchema);