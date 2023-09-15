const express = require("express");
const routes = express();
const auth = require("../middleware/auth")
const validate = require("../middleware/custom_validator");
const userController = require("../controllers/userController");
routes.post("/addReview", auth.auth, userController.review);
routes.delete("/deleteReview", auth.auth,userController.deleteReview);
module.exports = routes;