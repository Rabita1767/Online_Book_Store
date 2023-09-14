const mongoose = require('mongoose');

// Defined the schema
const productSchema = new mongoose.Schema({
    isbn: { type: String, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    author: { type: String, required: true },
    publisher: { type: String },
    discount_price: { type: Number, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    review: { type: [mongoose.Types.ObjectId], ref: "Review" },
    //reviews: { type: [String], required: true },
}, { timestamps: true }
);

// Created the model
const Products = mongoose.model('Products', productSchema);

module.exports = Products;
