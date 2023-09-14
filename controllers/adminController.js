const userModel = require("../models/users");
const bookModel = require("../models/book");
const authModel = require("../models/auth")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCode");
const { validationResult } = require("express-validator");
const { sendResponse } = require("../util/common");
//const validate = require("../middleware/validate")
const SECRET_KEY = "myapi";
class admin {
    async addBook(req,res)
    {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                res.status(400).send(failure("Failed to add the book", validation));
            }
            const { isbn,name, price, category, stock, author, publisher, discount_price, rating } = req.body;
            const products = new mangaModel({ name: name, price: price, category: category, stock: stock, brand: brand, color: color, size: size, rating: rating });
            await products.save()
                .then((data => {
                    res.status(200).send(success("Succesfully inserted data", data));
                }))

        } catch (error) {
            console.log(error);
            res.status(500).send(failure("Data insertion Unsuccessful"));
        }
    }
}
module.exports = new admin();