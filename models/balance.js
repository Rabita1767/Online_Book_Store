const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    // Using the default _id field as the unique identifier
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (if you have one)
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'failed'],
        default: 'pending', // Set a default status
    },

});

const Balance = mongoose.model('Balance', balanceSchema);

module.exports = Balance;
