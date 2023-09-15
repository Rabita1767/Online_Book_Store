const userModel = require("../models/users");
const bookModel = require("../models/book"); const authModel = require("../models/auth");
const reviewModel = require("../models/review");
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
                // return res.status(400).send(failure("Product not found!"));
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
            const findUser = await userModel.findById({ _id: req.userId });
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User not found!");
            }


        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
}
module.exports = new user();