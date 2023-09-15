const userModel = require("../models/users");
const bookModel = require("../models/book");
const authModel = require("../models/auth")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCode");
const { validationResult } = require("express-validator");
const validate = require("../middleware/custom_validator");
const { sendResponse } = require("../util/common");
//const validate = require("../middleware/validation")
const SECRET_KEY = "myapi";
class admin {
    async addBook(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the book", validation);
            }
            const { isbn, name, price, category, stock, author, publisher } = req.body;
            const products = new bookModel({ isbn: isbn, name: name, price: price, category: category, stock: stock, author: author, publisher: publisher });
            await products.save()
            return sendResponse(res, HTTP_STATUS.OK, "Successfully stored data", products);

        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async deleteBook(req, res) {
        try {
            const { id } = req.params;
            const findBook = await bookModel.findById({ _id: id });
            console.log(id);
            if (!findBook) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "This book is not available!");
            }
            await bookModel.deleteOne({ _id: id });
            return sendResponse(res, HTTP_STATUS.OK, "Book has been deleted successfully");

        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async viewUserData(req, res) {
        try {
            const filter = {};
            const { id, name, email, order_number, page, limit } = req.query;
            let parsedpage = parseInt(page) || 1;
            let parsedlimit = parseInt(limit) || 10;
            const viewUsers = await userModel.find({}).select("-createdAt -updatedAt");
            if (id) {
                filter._id = id;
            }
            if (name) {
                filter.name = name;
            }
            if (email) {
                filter.email = email;
            }
            if (order_number) {
                const orderArray = {};
                filter.order.orderArray = { $in: viewUsers.order };
            }
            //let start = (parseInt(page) - 1) * parseInt(limit);
            let start = (parsedpage - 1) * parsedlimit;
            const findUsers = await userModel.find(filter).skip(start).limit(limit).select("-createdAt -updatedAt -__v");
            if (!findUsers) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Unable to fetch data!")
            }
            if (findUsers.length == 0) {
                return sendResponse(res, HTTP_STATUS.NO_CONTENT, "No user found!");
            }
            return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findUsers);
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.query;
            const findUserinUser = await userModel.findById({ _id: id });
            const findUserinAuth = await authModel.findOne({ user: id });
            if (findUserinUser && findUserinAuth) {
                await userModel.deleteOne({ _id: id });
                await authModel.deleteOne({ user: id });
                return sendResponse(res, HTTP_STATUS.OK, "User has been deleted Successfully!");
            }
            return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User not found!");

        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }

}
module.exports = new admin();