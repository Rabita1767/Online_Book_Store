const { body, query, param } = require("express-validator");

const validator = {
    create: [
        body("isbn")
            .exists()
            .withMessage("ISBN is missing")
            .bail()
            .notEmpty()
            .withMessage("ISBN has to be provided")
            .bail()
            .isString()
            .withMessage("ISBN has to be a number")
            .bail()
            .isLength({ min: 13, max: 17 }),
        body("name")
            .exists()
            .withMessage("Name is missing")
            .bail()
            .notEmpty()
            .withMessage("Name can not be null")
            .bail()
            .isString()
            .withMessage("Name has to be a string")
            .bail()
            .isLength({ min: 2, max: 50 })
            .withMessage("Name must be less than 50 characters, and more than 2 characters"),
        body("price")
            .exists()
            .withMessage("Price is missing")
            .bail()
            .isNumeric()
            .withMessage("Price must be a number")
            .bail()
            .custom((value) => {
                if (value <= 0) {
                    throw new Error("Price cannot be 0 or negative");
                }
                return true;
            }),
        body("category")
            .exists()
            .withMessage("Category is missing")
            .bail()
            .notEmpty()
            .withMessage("Category can not be null")
            .bail()
            .isString()
            .withMessage("Category should be a string")
            .bail()
            .isLength({ min: 2, max: 50 })
            .withMessage("Category must be less than 50 characters, and more than 2 characters"),
        body("stock")
            .exists()
            .withMessage("Stock is missing")
            .bail()
            .notEmpty()
            .withMessage("Stock can not be null")
            .bail()
            .isNumeric()
            .withMessage("Stock has to be a number")
            .bail()
            .isLength({ min: 1, max: 10 })
            .withMessage("Stock must be less than 11 digits")
            .bail()
            .custom((value) => {
                if (value <= 0 || value > 100000) {
                    throw new Error("Stock cant be more than 100000");
                }
                return true;
            }),
        body("author")
            .exists()
            .withMessage("Author is missing")
            .bail()
            .notEmpty()
            .withMessage("Author cant be null")
            .bail()
            .isString()
            .withMessage("Author must be a string")
            .bail()
            .isLength({ min: 2, max: 50 })
            .withMessage("Author name must be less than 50 characters, and more than 2 characters"),
        body("publisher")
            .exists()
            .withMessage("Publisher is missing")
            .bail()
            .notEmpty()
            .withMessage("Publisher cant be null")
            .bail()
            .isString()
            .withMessage("Publisher must be a string"),
        // body("rating")
        //     .exists()
        //     .withMessage("Rating was not provided")
        //     .bail()
        //     .isNumeric()
        //     .withMessage("Rating must be numeric")
        //     .bail()
        //     .custom((value) => {
        //         if (value <= 0 || value > 5) {
        //             throw new Error("Rating has to be greater than 0 and less than or equal to 5");
        //         }
        //         return true;
        //     }),

    ],
};

module.exports = validator;




// const { body } = require("express-validator");

// const validator =
// {
//     create: [
//         body("name").exists().withMessage("This request should contain name property").isString().withMessage("Name should be string"),

//     ]
// }

// const express = require("express");
// const app = express();
// const { success, failure } = require("../write/message");

// const createValidation = (req, res, next) => {
//     const { name, price, category, brand, color, size } = req.body;
//     const errors = {};
//     if (name === "" || !name) {
//         errors.name = "Name is missing";
//     }

//     if (!price || price === "") {
//         errors.price = "Price is missing";
//     }
//     else if (price < 4) {
//         errors.pricelimit = "Price cant be less than 4";
//     }
//     if (!category || category === "") {
//         errors.stock = "Stock is missing";
//     }
//     if (!brand || brand === "") {
//         errors.stocklimit = "Stock cant be less than 10";
//     }
//     if (!color || color === "") {
//         errors.stocklimit = "Stock cant be less than 10";
//     }
//     if (!size || size === "") {
//         errors.author = "Author is missing";
//     }


//     if (Object.keys(errors).length > 0) {
//         const errorMessages = Object.keys(errors).map(field => errors[field]);
//         return { failure: true, message: errorMessages };
//     }
//     next();
// };

// module.exports = createValidation;
//module.exports = validator;