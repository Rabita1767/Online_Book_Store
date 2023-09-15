const mongoose = require('mongoose');

// Defined the schema
const reviewSchema = new mongoose.Schema({
    comment: { type: String, required: false, default: "none" },
    bookId: { type: mongoose.Types.ObjectId, ref: "Products", required: true },
    userId: { type: mongoose.Types.ObjectId, ref: "Users", required: true },
    rating: { type: Number, required: true }
    //reviews: { type: [String], required: true },
}, { timestamps: true }
);

// Created the model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
