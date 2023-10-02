const express = require("express");
const routes = express();
const auth = require("../middleware/auth")
const validate = require("../middleware/custom_validator");
const cartController = require("../controllers/cartController");
routes.post("/addToCart", auth.auth, auth.isUser, cartController.cart);
routes.delete("/removeFromCart", auth.auth, cartController.removeItem);
routes.get("/checkout", auth.auth, cartController.checkout);
routes.get("/viewCart", auth.auth, cartController.viewCart);
module.exports = routes;