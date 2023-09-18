const userModel = require("../models/users");
const bookModel = require("../models/book"); const authModel = require("../models/auth");
const reviewModel = require("../models/review");
const orderModel = require("../models/order");
const balanceModel = require("../models/balance");
const { sendResponse } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCode");
class user {
    async review(req, res) {
        try {
            const { comment, bookId, rating } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
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
                const update = await bookModel.find({}).populate("review");
                // return res.status(200).send(success("Review updated Successfully", update));
                return sendResponse(res, HTTP_STATUS.OK, "Updated Successfully", update);
            }
            const result = new reviewModel({
                comment: comment, bookId: bookId, userId: req.userId, rating: rating
            })
            await result.save();
            findUser.review.push(result._id);
            await findUser.save();
            findProduct.review.push(result._id);
            await findProduct.save();
            const getProducts = await bookModel.find({})
                .populate("review");
            return sendResponse(res, HTTP_STATUS.OK, "Review added successfully", getProducts);
            //return res.status(200).send(success("Successfully stored review", getProducts));
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");

        }
    }
    async deleteReview(req, res) {
        try {
            const { bookId } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User not found");
            }
            const getReview = await reviewModel.findOne({ bookId: bookId });
            console.log(getReview)
            const index = findUser.review.findIndex((x) => x == getReview._id);
            findUser.review.splice(index, 1);
            await findUser.save();
            const product = await bookModel.findById({ _id: bookId });
            const productIndex = product.review.findIndex((y) => y == getReview._id)
            product.review.splice(productIndex, 1);
            await product.save();
            const findReview = await reviewModel.findOneAndDelete({ $and: [{ userId: req.userId }, { bookId: bookId }] });
            return sendResponse(res, HTTP_STATUS.OK, "Review has been deleted!");

        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async updateReview(req, res) {
        try {
            const { bookId, rating, comment } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
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
            const findReview = await reviewModel.findOneAndUpdate(
                { "bookId": bookId },
                { $set: updateFields },
                { new: true }
            );
            return sendResponse(res, HTTP_STATUS.OK, "Data has been updated", findReview);
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async userProfile(req, res) {
        try {
            const findUser = await userModel.findById({ _id: req.userId })
                .populate("order")
                .populate("review");
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign up!");
            }

            return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findUser);
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async addBalance(req, res) {
        try {
            const { balance, currency } = req.body;
            const findUser = await userModel.findById({ _id: req.userId });
            const findAuth = await authModel.findOne({ user: req.userId });
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in!");
            }
            if (balance <= 10 || balance >= 1000) {
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
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }

    }

}
module.exports = new user();