const express = require("express");
const routes = express();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const validate = require("../middleware/custom_validator");
const adminController = require("../controllers/adminController");
const validation = require("../middleware/validation");

// routes.post("/signup", validation.signup, authController.auth);
routes.post("/signup", authController.auth);
routes.post("/login", authController.login);
routes.get("/getAll", authController.getAll);
routes.use("*", authController.url);

module.exports = routes;