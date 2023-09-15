const express = require("express");
const routes = express();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");
const validator = require("../middleware/custom_validator");
routes.post("/addBook", auth.isRole, validation.create, adminController.addBook);
routes.delete("/deleteBook/:id", auth.isRole, adminController.deleteBook);
routes.get("/viewUser", auth.isRole, validator.validatePage, adminController.viewUserData);
routes.delete("/deleteUser", auth.isRole, auth.isSuper, adminController.deleteUser);
module.exports = routes;