const userModel = require("../models/users");
const bookModel = require("../models/book");
const authModel = require("../models/auth")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCode");
const { validationResult } = require("express-validator");
const { sendResponse } = require("../util/common");
const validate = require("../middleware/validation")
const SECRET_KEY = "myapi";
class admin {
    async addBook(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                // res.status(400).send(failure("Failed to add the book", validation));
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
}
module.exports = new admin();