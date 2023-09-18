const userModel = require("../models/users");
const bookModel = require("../models/book");
const authModel = require("../models/auth")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCode");
const { validationResult } = require("express-validator");
const validate = require("../middleware/custom_validator");
const { sendResponse } = require("../util/common");
const { name } = require("ejs");
//const validate = require("../middleware/validation")
const SECRET_KEY = "myapi";
class admin {
    async addBook(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the book", validation);
            }
            const { isbn, name, price, category, stock, author, publisher, discountPercentage, discountStart, discountEnd } = req.body;
            const products = new bookModel({ isbn: isbn, name: name, price: price, category: category, stock: stock, author: author, publisher: publisher, discountPercentage: discountPercentage, discountStart: discountStart, discountEnd: discountEnd });
            const existBook = await bookModel.findOne({ isbn: isbn })
            if (existBook) {
                return sendResponse(res, HTTP_STATUS.CONFLICT, "Book isbn already exist");
            }
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
    async updateBook(req, res) {

        try {
            const { id } = req.query
            const updateFields = {};
            if (isbn) {
                updateFields.isbn = isbn;
            }
            if (name) {
                updateFields.name = name;
            }
            if (price) {
                updateFields.price = price;
            }
            if (category) {
                updateFields.category = category;
            }
            if (stock) {
                updateFields.stock = stock;
            }
            if (author) {
                updateFields.author = author;
            }
            if (publisher) {
                updateFields.publisher = publisher;
            }
            console.log(updateFields)
            const updateResult = await bookModel.updateOne({ _id: id }, { $set: updateFields });
            console.log(updateResult);
            return sendResponse(res, HTTP_STATUS.OK, "Data updated successfully!", updateResult);

        } catch (error) {
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async updateUser(req, res) {

        try {
            const { id } = req.query
            const updateFieldsAuth = {};
            const { name, email, phone, balance } = req.body;
            if (name) {
                updateFieldsAuth.name = name;
            }
            if (email) {
                updateFieldsAuth.email = email;
            }
            if (phone) {
                updateFieldsAuth.phone = phone;
            }
            if (balance) {
                updateFieldsAuth.balance = balance;
            }
            if (Object.keys(updateFieldsAuth).length == 0) {
                return sendResponse(res, HTTP_STATUS.NOT_ACCEPTABLE, "No data to update");
            }

            await authModel.updateOne({ user: id }, { $set: updateFieldsAuth });


            await userModel.updateOne({ _id: id }, { $set: updateFieldsAuth });
            return sendResponse(res, HTTP_STATUS.OK, "Data has been updated");

        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async updateDiscount(req, res) {
        try {
            const { id, discountPercentage, discountStart, discountEnd } = req.body;
            const findProduct = await bookModel.findOne({ _id: id });
            if (!findProduct) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book not found!");
            }
            const query = {}
            if (discountPercentage) {
                query.discountPercentage = discountPercentage;
            }
            if (discountStart) {
                query.discountStart = discountStart;
            }
            if (discountEnd) {
                query.discountEnd = discountEnd;
            }
            console.log(query.discountStart)
            const updatedDiscount = await bookModel.updateOne({ "_id": id }, { $set: query })
            return sendResponse(res, HTTP_STATUS.OK, "Discount has been updated", updatedDiscount)
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }



}
module.exports = new admin();