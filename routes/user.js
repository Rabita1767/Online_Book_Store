const express = require("express");
const routes = express();
const auth = require("../middleware/auth")
const validate = require("../middleware/custom_validator");
const validation = require("../middleware/validation");
const userController = require("../controllers/userController");
routes.post("/addReview", auth.auth, auth.isUser, validation.addReview, userController.review);
routes.delete("/deleteReview", auth.auth, auth.isUser, validation.deleteReview, userController.deleteReview);
routes.patch("/updateReview", auth.auth, auth.isUser, validation.updateReview, userController.updateReview);
routes.get("/viewProfile", auth.auth, userController.userProfile);
routes.post("/addBalance", auth.auth, auth.isUser, validation.addBalance, userController.addBalance);
routes.get("/viewTransaction", auth.auth, auth.isUser, userController.viewTrasaction);
routes.post("/passwordReset", auth.auth, auth.isUser, validation.resetPassword, userController.resetPassword);
routes.post("/updateProfile", auth.auth, auth.isUser, validation.updateProfile, userController.updateProfile);
module.exports = routes;