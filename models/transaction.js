const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
    badge:
    {
        type: String,
        default: "none"
    },
    cart:
    {
        type: mongoose.Types.ObjectId,
        ref: "Cart",

    },
    user:
    {
        type: mongoose.Types.ObjectId, ref: "Users", required: true
    },
    products:
        [
            {
                p_id: { type: mongoose.Types.ObjectId, ref: "Products", required: true },
                quantity: { type: Number, required: true }
            }
        ],
    totalPrice: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },

}, { timestamps: true })
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction