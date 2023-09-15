const mongoose = require("mongoose");
//const jwt = require("jwt");
const bcrypt = require("bcrypt");
const authSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword:
    {
        type: String,
        required: true
    },
    user:
    {
        type: mongoose.Types.ObjectId,
        ref: "Users",
        required: true
    },
    role:
    {
        type: Number,
        required: false,
        default: 2
    },
    superAdmin:
    {
        type: Boolean,
        required: false,
        default: false
    },
    failedLoginAttempt:
    {
        type: Number,
        default: 0,
        required: false
    },
    balance: { type: Number, required: true, default: 0, min: 0, max: 10000 },
    timestamp: { type: Date }

}, { timestamps: true }
)

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;