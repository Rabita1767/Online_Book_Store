const express = require("express");
const routes = express();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

routes.post("/addBook", validation.create, adminController.addBook);

module.exports = routes;