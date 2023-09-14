const { body, query, param } = require("express-validator");

const validator = {
    create: [
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
        body("brand")
            .exists()
            .withMessage("Brand is missing")
            .bail()
            .notEmpty()
            .withMessage("Brand can not be null")
            .bail()
            .isString()
            .withMessage("Brand has to be a string")
            .bail()
            .isLength({ min: 1, max: 50 })
            .withMessage("Description must be less than 50 characters, and more than 1 character"),
        body("color")
            .exists()
            .withMessage("Color is missing")
            .bail()
            .notEmpty()
            .withMessage("Color cant be null")
            .bail()
            .isString()
            .withMessage("Color must be a string")
            .bail()
            .isLength({ min: 2, max: 50 })
            .withMessage("Description must be less than 50 characters, and more than 2 characters"),
        body("size")
            .exists()
            .withMessage("Size is missing")
            .bail()
            .notEmpty()
            .withMessage("Size cant be null")
            .bail()
            .isString()
            .withMessage("Size must be a string"),



        body("rating")
            .exists()
            .withMessage("Rating was not provided")
            .bail()
            .isNumeric()
            .withMessage("Rating must be numeric")
            .bail()
            .custom((value) => {
                if (value <= 0 || value > 5) {
                    throw new Error("Rating has to be greater than 0 and less than or equal to 5");
                }
                return true;
            }),

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