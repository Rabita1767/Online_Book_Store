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
routes.get("/viewTransaction", auth.auth, auth.isUser, userController.viewTrasaction);
routes.post("/passwordReset", auth.auth, auth.isUser, userController.resetPassword);
routes.post("/updateProfile", auth.auth, auth.isUser, userController.updateProfile);
module.exports = routes;