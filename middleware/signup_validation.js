const { body, query, param } = require("express-validator");

const validator = {
    // create: [
    //     body("isbn")
    //         .exists()
    //         .withMessage("ISBN is missing")
    //         .bail()
    //         .notEmpty()
    //         .withMessage("ISBN has to be provided")
    //         .bail()
    //         .isString()
    //         .withMessage("ISBN has to be a number")
    //         .bail()
    //         .isLength({ min: 13, max: 17 }),
    //     body("name")
    //         .exists()
    //         .withMessage("Name is missing")
    //         .bail()
    //         .notEmpty()
    //         .withMessage("Name can not be null")
    //         .bail()
    //         .isString()
    //         .withMessage("Name has to be a string")
    //         .bail()
    //         .isLength({ min: 2, max: 50 })
    //         .withMessage("Name must be less than 50 characters, and more than 2 characters"),
    //     body("price")
    //         .exists()
    //         .withMessage("Price is missing")
    //         .bail()
    //         .isNumeric()
    //         .withMessage("Price must be a number")
    //         .bail()
    //         .custom((value) => {
    //             if (value <= 0) {
    //                 throw new Error("Price cannot be 0 or negative");
    //             }
    //             return true;
    //         }),
    //     body("category")
    //         .exists()
    //         .withMessage("Category is missing")
    //         .bail()
    //         .notEmpty()
    //         .withMessage("Category can not be null")
    //         .bail()
    //         .isString()
    //         .withMessage("Category should be a string")
    //         .bail()
    //         .isLength({ min: 2, max: 50 })
    //         .withMessage("Category must be less than 50 characters, and more than 2 characters"),
    //     body("stock")
    //         .exists()
    //         .withMessage("Stock is missing")
    //         .bail()
    //         .notEmpty()
    //         .withMessage("Stock can not be null")
    //         .bail()
    //         .isNumeric()
    //         .withMessage("Stock has to be a number")
    //         .bail()
    //         .isLength({ min: 1, max: 10 })
    //         .withMessage("Stock must be less than 11 digits")
    //         .bail()
    //         .custom((value) => {
    //             if (value <= 0 || value > 100000) {
    //                 throw new Error("Stock cant be more than 100000");
    //             }
    //             return true;
    //         }),
    //     body("author")
    //         .exists()
    //         .withMessage("Author is missing")
    //         .bail()
    //         .notEmpty()
    //         .withMessage("Author cant be null")
    //         .bail()
    //         .isString()
    //         .withMessage("Author must be a string")
    //         .bail()
    //         .isLength({ min: 2, max: 50 })
    //         .withMessage("Author name must be less than 50 characters, and more than 2 characters"),
    //     body("publisher")
    //         .exists()
    //         .withMessage("Publisher is missing")
    //         .bail()
    //         .notEmpty()
    //         .withMessage("Publisher cant be null")
    //         .bail()
    //         .isString()
    //         .withMessage("Publisher must be a string"),
    //     // body("rating")
    //     //     .exists()
    //     //     .withMessage("Rating was not provided")
    //     //     .bail()
    //     //     .isNumeric()
    //     //     .withMessage("Rating must be numeric")
    //     //     .bail()
    //     //     .custom((value) => {
    //     //         if (value <= 0 || value > 5) {
    //     //             throw new Error("Rating has to be greater than 0 and less than or equal to 5");
    //     //         }
    //     //         return true;
    //     //     }),

    // ],
    signup: [
        body("name")
            .exists()
            .withMessage("Name must be provided")
            .bail()
            .isString()
            .withMessage("Name must be a string")
            .bail()
            .matches(/^[a-zA-Z ]*$/)
            .withMessage("Name must be in only alphabets")
            .isLength({ min: 1, max: 100 })
            .withMessage("Name must be between 1 and 100 characters")
            .bail(),
        body("email")
            .exists()
            .withMessage("Email must be provided")
            .bail()
            .isEmail()
            .withMessage("Invalid Email Address")
            .bail()
            .isEmail()
            .withMessage("Email must be in valid format"),
        body("password")
            .exists()
            .withMessage("Password must be provided")
            .bail()
            .isString()
            .withMessage("Password must be a string")
            .bail()
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minSymbols: 1,
                minNumbers: 1,
            })
            .withMessage(
                "Password must contain at least 8 characters with 1 lower case, 1 upper case, 1 number, 1 symbol"
            ),
        body("confirmPassword")
            .exists()
            .withMessage("Password must be provided")
            .bail()
            .isString()
            .withMessage("Password must be a string")
            .bail()
            .custom((value, { req }) => {
                if (value === req.body.password) {
                    return true;
                }
                throw new Error("Passwords do not match");
            }),
        body("phone")
            .exists()
            .withMessage("Phone number must be provided")
            .bail()
            .isString()
            .withMessage("Phone number must be a string")
            .bail()
            .matches(/(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/)
            .withMessage("Phone number must be in a valid format"),
        // body("address.area")
        //     .exists()
        //     .withMessage("Area was not provided")
        //     .bail()
        //     .isString()
        //     .withMessage("Area must be a string"),
        // body("address.city")
        //     .exists()
        //     .withMessage("City was not provided")
        //     .bail()
        //     .isString()
        //     .withMessage("City must be a string"),
        // body("address.country")
        //     .exists()
        //     .withMessage("Country was not provided")
        //     .bail()
        //     .isString()
        //     .withMessage("Country must be a string"),
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