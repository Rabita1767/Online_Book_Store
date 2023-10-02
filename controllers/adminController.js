const userModel = require("../models/users");
const bookModel = require("../models/book");
const authModel = require("../models/auth");
const discountModel = require("../models/discount");
const transactionModel = require("../models/transaction");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCode");
const { validationResult } = require("express-validator");
const validate = require("../middleware/custom_validator");
const { sendResponse } = require("../util/common");
const { name } = require("ejs");
const log = require("../util/logFile");
//const validate = require("../middleware/validation")
const SECRET_KEY = "myapi";
class admin {
    async addBook(req, res) {
        try {
            log.createLogFile("/book/addBook", "Success")
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
            log.createLogFile("/book/addBook", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async deleteBook(req, res) {
        try {
            log.createLogFile("/book/deleteBook", "Success")
            const { id } = req.params;
            const findBook = await bookModel.findById({ _id: id });
            console.log(id);
            if (!findBook) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "This book is not available!");
            }
            await bookModel.deleteOne({ _id: id });
            return sendResponse(res, HTTP_STATUS.OK, "Book has been deleted successfully");

        } catch (error) {
            log.createLogFile("/book/deleteBook", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async viewUserData(req, res) {
        try {
            log.createLogFile("/book/viewUserData", "Success")
            const filter = {};
            const { id, name, email, order_number, page, limit } = req.query;
            let parsedpage = parseInt(page) || 1;
            let parsedlimit = parseInt(limit) || 10;
            const viewUsers = await userModel.find({}).select("-createdAt -updatedAt");
            const accept = ["id", "name", "email", "order_number", "page", "limit"];
            const wrongParam = Object.keys(req.query).filter((x) => !accept.includes(x));
            console.log(`wrong ${wrongParam}`)
            if (wrongParam.length > 0) {
                return sendResponse(res, HTTP_STATUS.CONFLICT, "Request Invalid!");
            }
            if (id) {
                filter._id = id;
            }
            if (name) {
                filter.name = { $regex: name, $options: "i" };
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
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No user found!");
            }
            return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findUsers);
        } catch (error) {
            log.createLogFile("/book/viewUserData", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async deleteUser(req, res) {
        try {
            log.createLogFile("/book/deleteUser", "Success")
            const { id } = req.query;
            const findUserinUser = await userModel.findById({ _id: id });
            const findUserinAuth = await authModel.findOne({ user: id });
            const accept = ["id"];
            const wrongParam = Object.keys(req.query).filter((x) => !accept.includes(x));
            console.log(`wrong ${wrongParam}`)
            if (wrongParam.length > 0) {
                return sendResponse(res, HTTP_STATUS.CONFLICT, "Request Invalid!");
            }
            if (findUserinUser && findUserinAuth) {
                await userModel.deleteOne({ _id: id });
                await authModel.deleteOne({ user: id });
                return sendResponse(res, HTTP_STATUS.OK, "User has been deleted Successfully!");
            }
            return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User not found!");

        } catch (error) {
            log.createLogFile("/book/deleteUser", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async updateBook(req, res) {

        try {
            log.createLogFile("/book/updateBook", "Success")
            const { _id } = req.query;
            console.log(_id);
            const updateFields = {};
            const { isbn, name, price, category, stock, author, publisher, discountPercentage, discountStart, discountEnd } = req.body;
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to update the book", validation);
            }
            if (isbn) {
                updateFields.isbn = isbn;
                const findIsbn = await bookModel.findOne({ isbn: isbn })
                if (findIsbn && findIsbn._id != _id) {
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "ISBN already exist!");
                }
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
            if (discountPercentage) {
                updateFields.discountPercentage = discountPercentage;
            }
            if (discountStart) {
                updateFields.discountStart = discountStart;
            }
            if (discountEnd) {
                updateFields.discountEnd = discountEnd
            }
            console.log(updateFields)
            const updateResult = await bookModel.updateOne({ _id: _id }, { $set: updateFields });
            console.log(updateResult);
            if (updateResult.modifiedCount === 0) {
                return sendResponse(res, HTTP_STATUS.EXPECTATION_FAILED, "No document was updated");
            }
            return sendResponse(res, HTTP_STATUS.OK, "Data updated successfully!", updateResult);

        } catch (error) {
            log.createLogFile("/book/updateBook", "failure")
            console.log(error)
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async updateUser(req, res) {
        try {
            log.createLogFile("/book/updateUser", "Success")
            const { id } = req.query
            const updateFieldsAuth = {};
            const { name, email, phone, balance } = req.body;
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to update the user", validation);
            }
            if (name) {
                updateFieldsAuth.name = name;
            }
            if (email) {
                updateFieldsAuth.email = email;
                const existEmail = await userModel.findOne({ email: email })
                if (existEmail && existEmail._id != id) {
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "Email already registered");
                }
            }
            if (phone) {
                updateFieldsAuth.phone = phone;
                const existPhone = await userModel.findOne({ phone: phone })
                if (existPhone && existPhone._id != id) {
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "Phone Number already registered");
                }
            }
            if (balance) {
                updateFieldsAuth.balance = balance;
            }
            console.log(`hooooooo ${updateFieldsAuth.name}`)
            if (Object.keys(updateFieldsAuth).length == 0) {
                return sendResponse(res, HTTP_STATUS.NOT_ACCEPTABLE, "No data to update");
            }

            await authModel.updateOne({ user: id }, { $set: updateFieldsAuth });


            await userModel.updateOne({ _id: id }, { $set: updateFieldsAuth });
            return sendResponse(res, HTTP_STATUS.OK, "Data has been updated");

        } catch (error) {
            log.createLogFile("/book/updateUser", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async addDiscount(req, res) {
        try {
            log.createLogFile("/book/addDiscount", "Success")
            const { id, discountPercentage, discountStart, discountEnd } = req.body;
            const findProduct = await bookModel.findById({ _id: id });
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to update the user", validation);
            }
            if (!findProduct) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Product not found!");
            }
            const findDiscount = await discountModel.findOne({ productId: id });
            if (discountPercentage > 60) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Cant process request!");
            }
            if (!findDiscount) {
                const result = new discountModel({
                    productId: id, discountPercentage: discountPercentage, discountStart: discountStart, discountEnd: discountEnd
                })
                result.price = findProduct.price;
                result.discountPrice = result.price - (result.price * (result.discountPercentage / 100));
                await result.save();
                findProduct.discountPercentage = result.discountPercentage;
                findProduct.discountStart = result.discountStart;
                findProduct.discountEnd = result.discountEnd;
                await findProduct.save();
                return sendResponse(res, HTTP_STATUS.OK, "Successfully stored data", result);
            }
            return sendResponse(res, HTTP_STATUS.NOT_ACCEPTABLE, "Discount has been added already!");

        } catch (error) {
            log.createLogFile("/book/addDiscount", "failure")
            console.log(`error now ${error}`)
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    }
    async updateDiscount(req, res) {
        try {
            log.createLogFile("/book/updateDiscount", "Success")
            const { id } = req.query;
            const { discountPercentage, discountStart, discountEnd } = req.body;
            const findDiscount = await discountModel.findOne({ productId: id });
            const findProduct = await bookModel.findById({ _id: id });
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to update the user", validation);
            }
            if (!findDiscount) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Add discount first!");
            }
            const query = {};
            if (discountPercentage) {
                query.discountPercentage = discountPercentage;
            }
            if (discountStart) {
                query.discountStart = discountStart;
            }
            if (discountEnd) {
                query.discountEnd = discountEnd;
            }
            const updatedResult = await discountModel.updateOne({ productId: id }, { $set: query });
            const find = await discountModel.findOne({ productId: id });
            find.discountPrice = find.price - (find.price * (find.discountPercentage / 100));
            console.log(`updated ${find.discountPrice}`)
            await find.save();
            await bookModel.updateOne({ _id: id }, { $set: query })
            return sendResponse(res, HTTP_STATUS.OK, "Discount updatd successfully!", updatedResult);

        } catch (error) {
            log.createLogFile("/book/updateDiscount", "failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async viewAllTransaction(req, res) {
        try {
            log.createLogFile("/book/viewAllTransaction", "Success")
            const findUser = await userModel.findById({ _id: req.userId })
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in!");
            }
            const view = await transactionModel.find({}).populate("user");
            if (view.length == 0) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No record found!");
            }
            return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", view)

        } catch (error) {
            log.createLogFile("/book/viewAllTransaction", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async updateProfile(req, res) {
        try {
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
            return sendResponse(res, HTTP_STATUS.OK, "Profile updated Successfully", updatedProfile);

        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }




}
module.exports = new admin();