const express = require("express");
const routes = express();
const auth = require("../middleware/auth")
const validate = require("../middleware/custom_validator");
const userController = require("../controllers/userController");
routes.post("/addReview", auth.auth, auth.isUser, userController.review);
routes.delete("/deleteReview", auth.auth, auth.isUser, userController.deleteReview);
routes.patch("/updateReview", auth.auth, auth.isUser, userController.updateReview);
routes.get("/viewProfile", auth.auth, userController.userProfile);
routes.post("/addBalance", auth.auth, auth.isUser, userController.addBalance);
module.exports = routes;