const mongoose = require('mongoose');

// Define the schema
const discountSchema = new mongoose.Schema({
    productId: { type: mongoose.Types.ObjectId, ref: "Products", required: true },
    price: { type: Number },
    discountPercentage: { type: Number, default: 0 },
    discountPrice: { type: Number },// Default to 0% discount
    // discountStart: { type: Date, required: true },
    // discountEnd: { type: Date, required: true },
    discountStart: Date,
    discountEnd: Date,
}, { timestamps: true });

// Create the model
const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
