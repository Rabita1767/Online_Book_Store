const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
    badge:
    {
        type: String,
        default: "none"
    },
    user:
    {
        type: mongoose.Types.ObjectId, ref: "Users", required: false
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
    status: { type: Boolean, default: false },
}, { timestamps: true })
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart