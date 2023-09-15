const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone:
    {
        type: Number,
        required: true,
        unique: true
    },
    badge:
    {
        type: String,
        default: "none"
    },
    // isVerified: {
    //     type: Boolean,
    //     default: false
    // },
    order:
    {
        type: [mongoose.Types.ObjectId],
        ref: "Order",
    },
    review: { type: [mongoose.Types.ObjectId], ref: "Review" },
    balance: { type: Number, required: true, default: 0, min: 0, max: 10000 }
}, { timestamps: true }
)

const Users = mongoose.model("Users", userSchema);
module.exports = Users;