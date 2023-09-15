const express = require("express");
const routes = express();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");
//const { authValidator } = require("../middleware/validation");
// const { userValidator } = require("../middleware/validation");

// routes.get("/all", UserController.getAll);
// routes.get("/detail/:id", UserController.getOneById);
// routes.post("/create", userValidator.create, UserController.create);

// routes.post("/login", AuthController.login);
// routes.post("/sign-up", authValidator.signup, AuthController.signup);
routes.post("/signup", authController.auth);
routes.post("/login", authController.login);


module.exports = routes;