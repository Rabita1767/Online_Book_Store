const express = require("express");
const routes = express();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");
const validator = require("../middleware/custom_validator");
// routes.post("/addBook", auth.isRole, validation.create, adminController.addBook);
routes.post("/addBook", adminController.addBook);
// routes.delete("/deleteBook/:id", auth.isRole, adminController.deleteBook);
routes.delete("/deleteBook/:id", adminController.deleteBook);
routes.get("/viewUser", auth.isRole, validator.validatePage, adminController.viewUserData);
routes.delete("/deleteUser", auth.isRole, auth.isSuper, adminController.deleteUser);
// routes.post("/updateBook", auth.isRole, validation.updateBook, adminController.updateBook);
routes.patch("/updateBook", adminController.updateBook);
routes.post("/updateUser", auth.auth, validation.updateUser, adminController.updateUser);
routes.post("/addDiscount", validation.addDiscount, adminController.addDiscount);
routes.patch("/updateDiscount", auth.auth, validation.updateDiscount, adminController.updateDiscount);
routes.get("/viewAllTransaction", auth.auth, auth.isRole, auth.isSuper, adminController.viewAllTransaction);
routes.post("/updateProfile", auth.auth, validation.updateProfile, adminController.updateProfile);
routes.get("/getAllUser", adminController.getAllUser)
routes.get("/getUserById", adminController.getUserById)
routes.get("/getBookById", adminController.getBookById);
module.exports = routes;