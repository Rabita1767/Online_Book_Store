const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({

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
    ststus: { type: String, default: "pending" }
}, { timestamps: true })
const Order = mongoose.model("Order", orderSchema);
module.exports = Order