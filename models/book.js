const mongoose = require('mongoose');

// Defined the schema
const productSchema = new mongoose.Schema({
    image: { type: String },
    isbn: { type: String, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    author: { type: String, required: true },
    publisher: { type: String },
    rating: { type: Number, required: true, default: 0 },
    review: { type: [mongoose.Types.ObjectId], ref: "Review" },
    discountPercentage: {
        type: Number,
        default: 0, // No discount by default
    },
    discountStart: Date,
    discountEnd: Date,
    // discountStart: { type: Date, required: true },
    // discountEnd: { type: Date, required: true },
}, { timestamps: true }
);

// Created the model
const Products = mongoose.model('Products', productSchema);

module.exports = Products;
