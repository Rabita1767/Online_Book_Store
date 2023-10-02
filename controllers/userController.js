const userModel = require("../models/users");
const bookModel = require("../models/book"); const authModel = require("../models/auth");
const reviewModel = require("../models/review");
const orderModel = require("../models/order");
const balanceModel = require("../models/balance");
const transactionModel = require("../models/transaction");
const { validationResult } = require("express-validator");
const { sendResponse } = require("../util/common");
const bcrypt = require("bcrypt");
const log = require("../util/logFile");
const HTTP_STATUS = require("../constants/statusCode");
class user {
    async review(req, res) {
        try {
            log.createLogFile("/user/addReview", "Success")
            const { comment, bookId, rating } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the review", validation);
            }
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign up");
            }
            const findProduct = await bookModel.findById({ _id: bookId });
            if (!findProduct) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book not found!");
            }
            const findExistingReview = await reviewModel.findOne({ $and: [{ bookId: bookId }, { userId: req.userId }] });
            if (findExistingReview) {
                const updatedReview = await reviewModel.findOneAndUpdate(
                    { "_id": findExistingReview._id },
                    { $set: { "comment": comment, "rating": rating } },
                    { new: true }
                );
                const findProductReview = await reviewModel.find({ bookId: bookId })
                //const findBook = await bookModel.findById({ _id: bookId });
                let rate = 0;
                findProductReview.map((x) => {
                    rate += x.rating;
                })
                findProduct.rating = (rate / findProductReview.length).toFixed(1);
                await findProduct.save();

                const update = await bookModel.findById({ _id: bookId }).populate("review");
                return sendResponse(res, HTTP_STATUS.OK, "Updated Successfully", update);
            }
            const result = new reviewModel({
                comment: comment, bookId: bookId, userId: req.userId, rating: rating
            })
            await result.save();
            findUser.review.push(result._id);
            await findUser.save();
            findProduct.review.push(result._id);
            const findProductReview = await reviewModel.find({ bookId: bookId })
            // const findBook = await bookModel.findById({ _id: bookId });
            let rate = 0;
            findProductReview.map((x) => {
                rate += x.rating;
            })
            findProduct.rating = (rate / findProductReview.length).toFixed(1);
            await findProduct.save();
            const getProducts = await bookModel.findById({ _id: bookId })
                .populate("review");
            return sendResponse(res, HTTP_STATUS.OK, "Review added successfully", getProducts);
            //return res.status(200).send(success("Successfully stored review", getProducts));
        } catch (error) {
            log.createLogFile("/user/addReview", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");

        }
    }
    async deleteReview(req, res) {
        try {
            log.createLogFile("/user/deleteReview", "Success")
            const { bookId } = req.query;
            const findUser = await userModel.findById({ _id: req.userId });
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to delete the review", validation);
            }
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User not found");
            }
            const getReview = await reviewModel.findOne({ $and: [{ bookId: bookId }, { userId: req.userId }] });
            console.log(getReview)
            if (!getReview) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No review has been given by you!");
            }
            const index = findUser.review.findIndex((x) => x == getReview._id);
            findUser.review.splice(index, 1);
            await findUser.save();
            const product = await bookModel.findById({ _id: bookId });
            const productIndex = product.review.findIndex((y) => y == getReview._id)
            product.review.splice(productIndex, 1);
            await product.save();
            const findReview = await reviewModel.findOneAndDelete({ $and: [{ userId: req.userId }, { bookId: bookId }] });
            const findExist = await reviewModel.find({ bookId: bookId });
            const book = await bookModel.findById({ _id: bookId })
            if (findExist.length == 0) {
                book.rating = 0;
                await book.save();
                return sendResponse(res, HTTP_STATUS.OK, "Review has been deleted!");
            }
            let rate = 0;
            findExist.map((x) => {
                rate += x.rating;
            })
            book.rating = (rate / findExist.length).toFixed(1);
            await book.save();
            return sendResponse(res, HTTP_STATUS.OK, "Review has been deleted!");

        } catch (error) {
            log.createLogFile("/user/deleteReview", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async updateReview(req, res) {
        try {
            log.createLogFile("/user/updateReview", "Success")
            const { bookId, rating, comment } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the review", validation);
            }
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User not found!");
            }
            const findBook = await bookModel.findById({ _id: bookId });
            if (!findBook) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book not found!");
            }
            const updateFields = {};
            if (rating) {
                updateFields.rating = rating;
            }
            if (comment) {
                updateFields.comment = comment;
            }
            // const findReview = await reviewModel.findOneAndUpdate(
            //     { "bookId": bookId },
            //     { $set: updateFields },
            //     { new: true }
            // );
            const findReview = await reviewModel.updateOne({ $and: [{ bookId: bookId }, { userId: req.userId }] }, { $set: updateFields })
            if (findReview.modifiedCount === 0) {
                return sendResponse(res, HTTP_STATUS.CONFLICT, "No review was given by you!Give a review first");
            }
            const findExist = await reviewModel.find({ bookId: bookId });
            const book = await bookModel.findById({ _id: bookId })
            let rate = 0;
            findExist.map((x) => {
                rate += x.rating;
            })
            book.rating = (rate / findExist.length).toFixed(1);
            await book.save();
            return sendResponse(res, HTTP_STATUS.OK, "Data has been updated", findReview);
        } catch (error) {
            log.createLogFile("/user/updateReview", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async userProfile(req, res) {
        try {
            log.createLogFile("/user/viewProfile", "Success")
            const findUser = await userModel.findById({ _id: req.userId })
                .populate("order")
                .populate("review");
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign up!");
            }

            return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findUser);
        } catch (error) {
            log.createLogFile("/user/viewProfile", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async addBalance(req, res) {
        try {
            log.createLogFile("/user/addBalance", "Success")
            const { balance, currency } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
            const findAuth = await authModel.findOne({ user: req.userId });
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the review", validation);
            }
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in!");
            }
            if (balance <= 10 || balance > 5000) {
                const result = new balanceModel({
                    userId: req.userId, amount: balance, currency: currency
                })
                result.status = "failed";
                await result.save();
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add amount!");
            }
            const result = new balanceModel({
                userId: req.userId, amount: balance, currency: currency
            })
            result.status = "completed";
            await result.save();
            findUser.balance += balance;
            findAuth.balance += balance;
            await findUser.save();
            await findAuth.save();
            return sendResponse(res, HTTP_STATUS.OK, "Successfully added balance to your wallet!", findUser);
        } catch (error) {
            log.createLogFile("/user/addBalance", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }

    }
    async viewTrasaction(req, res) {
        try {
            log.createLogFile("/user/viewTransaction", "Success")
            const findUser = await userModel.findById({ _id: req.userId });
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign up!");
            }
            const findTransaction = await transactionModel.findOne({ user: req.userId });
            if (!findTransaction) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Requet invalid!No record found!");
            }
            return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findTransaction);

        } catch (error) {
            log.createLogFile("/user/viewTransaction", "Failure")
            console.log(error)
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async resetPassword(req, res) {
        try {
            log.createLogFile("/user/passwordReset", "Success")
            const { old_password, new_password } = req.body;
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the review", validation);
            }
            const findUser = await userModel.findById({ _id: req.userId });
            const findAuthUser = await authModel.findOne({ user: req.userId });
            console.log(findUser);
            console.log(findAuthUser);
            if (!findUser) {
                // return res.status(400).send(failure("Please Log in first"));
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in!");
            }
            const check = await bcrypt.compare(old_password, findAuthUser.password);
            if (check) {
                const hashedNewPass = await bcrypt.hash(new_password, 10);
                findAuthUser.password = hashedNewPass;
                await findAuthUser.save();
                await findUser.save();
                // return res.status(200).send(success("Password has been updated", findAuthUser));
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Password has been updated", findAuthUser);
            }
            // return res.status(400).send(success("Please try again later"));
            return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please try again later");
        } catch (error) {
            log.createLogFile("/user/passwordReset", "Failure")
            console.log(error);
            return sendResponse(res, HTTP.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async updateProfile(req, res) {
        try {
            log.createLogFile("/user/updateProfile", "Success")
            const { name, email, phone } = req.body;
            const query = {};
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the book", validation);
            }
            const findUser = await userModel.findById({ _id: req.userId });
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in!");
            }
            if (name) {
                query.name = name;
            }
            if (email) {
                query.email = email;
                const findEmail = await userModel.findOne({ email: email })
                if (findEmail && findEmail._id != req.userId) {
                    console.log(`email id ${findEmail._id}`)
                    return sendResponse(res, HTTP_STATUS.SERVICE_UNAVAILABLE, "Email already registered")
                }
            }
            if (phone) {
                query.phone = phone;
                const findPhone = await userModel.findOne({ phone: phone })
                if (findPhone && findPhone._id != req.userId) {
                    return sendResponse(res, HTTP_STATUS.SERVICE_UNAVAILABLE, "Phone number already registered")
                }
            }
            const updatedProfile = await userModel.updateOne({ _id: req.userId }, { $set: query })
            await authModel.updateOne({ user: req.userId }, { $set: query })
            return sendResponse(res, HTTP_STATUS.OK, "Profile updated Successfully", updatedProfile);

        } catch (error) {
            log.createLogFile("/user/updateProfile", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }

}
module.exports = new user();