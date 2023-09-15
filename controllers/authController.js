//const mangaModelLog = require("../models/model");
const userModel = require("../models/users");
// const orderModel = require("../models/order")
// const transactionModel = require("../models/transactions");
// const reviewModel = require("../models/review");
// const mangaModel = require("../models/products")
const authModel = require("../models/auth")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCode");
const { validationResult } = require("express-validator");
const { sendResponse } = require("../util/common");
//const validate = require("../middleware/validate")
const SECRET_KEY = "myapi";
class Auth {
    async auth(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res.status(400).send(failure(validation));
            }
            else {
                const { name, email, password, phone, role, superAdmin } = req.body;
                const exist = await userModel.findOne({ email: email });
                console.log(`user ${exist}`);
                if (exist) {
                    //return res.status(400).send(failure("User already exist!"));
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "User already exist!");
                }
                const hassedPass = await bcrypt.hash(password, 10);
                const user = new userModel({ name: name, email: email, phone: phone });
                const addUser = await user.save();
                const authUser = new authModel({ name: name, email: email, password: hassedPass, user: addUser._id, role: role, superAdmin: superAdmin });
                const savedAuth = await authUser.save();
                //const token = jwt.sign({ email: addUser.email, id: addUser._id, role: addUser.role }, SECRET_KEY, { expiresIn: "1h" });
                // return res.status(200).send(success("Successfully signed up!", { user: savedAuth, token: token }));
                //return res.status(200).send(success("Successfully signed up!", { user: savedAuth }));
                return sendResponse(res, HTTP_STATUS.OK, "Successfully signed up!");
            }

        } catch (error) {
            console.log(error)
            //res.status(500).send(failure("Internal Server Error!"));
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const Userexist = await authModel.findOne({ email: email })
                .populate("user");
            console.log(Userexist)
            if (!Userexist) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please Sign up first!");
            }
            const pass = await bcrypt.compare(password, Userexist.password);
            console.log(pass)
            if (!pass) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Wrong Credentials");
            }
            const token = jwt.sign({ email: Userexist.email, id: Userexist.user._id, role: Userexist.role, superAdmin: Userexist.superAdmin }, SECRET_KEY, { expiresIn: "1h" });
            console.log(Userexist.user._id);
            console.log(Userexist.role);
            //return res.status(200).json({ result: Userexist, token: token });
            return sendResponse(res, HTTP_STATUS.OK, "Successfully logged in", { result: Userexist, token: token });
        } catch (error) {
            console.log(error)
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async userProfile(req, res) {
        try {
            const findUser = await userModel.findById({ _id: req.userId })
                .populate("order");
            if (!findUser) {
                return res.status(400).send(failure('Please log in first!'));
            }
            return res.status(200).send(success("Successfully fetched data", findUser));
        } catch (error) {
            console.log(error);
            return res.status(500).send(failure("Internal Server Error!"))
        }
    }
    async editProfile(req, res) {
        try {
            const { old_password, new_password } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
            const findAuthUser = await authModel.findOne({ user: req.userId });
            console.log(findUser);
            console.log(findAuthUser);
            if (!findUser) {
                return res.status(400).send(failure("Please Log in first"));
            }
            const check = await bcrypt.compare(old_password, findAuthUser.password);
            if (check) {
                const hashedNewPass = await bcrypt.hash(new_password, 10);
                findAuthUser.password = hashedNewPass;
                await findAuthUser.save();
                await findUser.save();
                return res.status(200).send(success("Password has been updated", findAuthUser));
            }
            return res.status(400).send(success("Please try again later"));
        } catch (error) {
            console.log(error);
            return res.status(500).send(failure("Internal Server Error!"));
        }
    }
    // async review(req, res) {
    //     try {
    //         const { comment, productId, rating } = req.body;
    //         const findUser = await userModel.findById({ _id: req.userId });
    //         if (!findUser) {
    //             return res.status(400).send(failure("Please log in!"));
    //         }
    //         const findProduct = await mangaModel.findById({ _id: productId });
    //         if (!findProduct) {
    //             return res.status(400).send(failure("Product not found!"));
    //         }
    //         const result = new reviewModel({
    //             comment: comment, productId: productId, userId: req.userId, rating: rating
    //         })
    //         await result.save();
    //         findUser.review.push(result._id);
    //         await findUser.save();
    //         findProduct.review.push(result._id);
    //         await findProduct.save();
    //         const getProducts = await mangaModel.find({})
    //             .populate("review");
    //         return res.status(200).send(success("Successfully stored review", getProducts));
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).send(failure("Internal Server Error!"));
    //     }
    // }
    async review(req, res) {
        try {
            const { comment, productId, rating } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
            if (!findUser) {
                return res.status(400).send(failure("Please log in!"));
            }
            const findProduct = await mangaModel.findById({ _id: productId });
            if (!findProduct) {
                return res.status(400).send(failure("Product not found!"));
            }
            const findExistingReview = await reviewModel.findOne({ $and: [{ productId: productId }, { userId: req.userId }] });
            if (findExistingReview) {
                const updatedReview = await reviewModel.findOneAndUpdate(
                    { "_id": findExistingReview._id },
                    { $set: { "comment": comment, "rating": rating } },
                    { new: true }
                );
                const update = await mangaModel.find({}).populate("review");
                return res.status(200).send(success("Review updated Successfully", update));
            }
            const result = new reviewModel({
                comment: comment, productId: productId, userId: req.userId, rating: rating
            })
            await result.save();
            findUser.review.push(result._id);
            await findUser.save();
            findProduct.review.push(result._id);
            await findProduct.save();
            const getProducts = await mangaModel.find({})
                .populate("review");
            return res.status(200).send(success("Successfully stored review", getProducts));
        } catch (error) {
            console.log(error);
            return res.status(500).send(failure("Internal Server Error!"));
        }
    }
    async deleteReview(req, res) {
        try {
            const { productId } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
            if (!findUser) {
                return res.status(400).send(failure("Please log in!"));
            }
            const getReview = await reviewModel.findOne({ productId: productId });
            console.log(getReview)
            const index = findUser.review.findIndex((x) => x == getReview._id);
            findUser.review.splice(index, 1);
            await findUser.save();
            const product = await mangaModel.findById({ _id: productId });
            const productIndex = product.review.findIndex((y) => y == getReview._id)
            product.review.splice(productIndex, 1);
            await product.save();
            const findReview = await reviewModel.findOneAndDelete({ $and: [{ userId: req.userId }, { productId: productId }] });

            return res.status(200).send(success("Review has been deleted"))

        } catch (error) {
            console.log(error);
            return res.status(500).send(failure("Internal Server Error!"));
        }
    }

}
module.exports = new Auth()