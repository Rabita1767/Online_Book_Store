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
    ],
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
            .isString()
            .withMessage("Email must be a string")
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
    updateBook: [
        query("id")
            .exists()
            .withMessage("ID has to be provided")
            .bail()
            .notEmpty()
            .withMessage("ID can not be null")
            .bail()
            .isMongoId()
            .withMessage("Invalid Id"),
        body("isbn")
            .optional()
            .bail()
            .notEmpty()
            .withMessage("ISBN has to be provided")
            .bail()
            .isString()
            .withMessage("ISBN has to be a number")
            .bail()
            .isLength({ min: 13, max: 17 }),
        body("name")
            .optional()
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
            .optional()
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
            .optional()
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
            .optional()
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
            .optional()
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
            .optional()
            .bail()
            .notEmpty()
            .withMessage("Publisher cant be null")
            .bail()
            .isString()
            .withMessage("Publisher must be a string"),
        body("discountPercentage")
            .optional()
            .bail()
            .notEmpty()
            .withMessage(" discountPercentage can not be null")
            .bail()
            .isNumeric()
            .withMessage("discountPercentage has to be a string")
            .bail()
            .custom((value) => {
                if (value < 0 || value > 80) {
                    throw new Error("Invalid Discount.Has to be within 0 to 80");
                }
                return true;
            }),
        body("discountStart")
            .optional()
            .bail()
            .notEmpty()
            .withMessage("StartDate can not be null")
            .bail()
            .isISO8601()
            .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),
        body("discountEnd")
            .optional()
            .bail()
            .notEmpty()
            .withMessage("StartDate can not be null")
            .bail()
            .isISO8601()
            .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),

    ],
    updateUser: [
        query("id")
            .exists()
            .withMessage("ID has to be provided")
            .bail()
            .notEmpty()
            .withMessage("ID can not be null")
            .bail()
            .isMongoId()
            .withMessage("Invalid Id"),
        body("name")
            .optional()
            .bail()
            .notEmpty()
            .withMessage("Name can not be null")
            .bail()
            .isString()
            .withMessage("Name has to be a string")
            .bail()
            .isLength({ min: 2, max: 50 })
            .withMessage("Name must be less than 50 characters, and more than 2 characters"),
        body("email")
            .optional()
            .bail()
            .notEmpty()
            .withMessage("Email can not be null")
            .bail()
            .isEmail()
            .withMessage("Invalid Email Address"),
        body("phone")
            .optional()
            .bail()
            .isString()
            .withMessage("Phone number must be a string")
            .bail()
            .matches(/(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/)
            .withMessage("Phone number must be in a valid format"),
        body("balance")
            .optional()
            .bail()
            .isNumeric()
            .withMessage("Balance must be a number")
            .bail()
            .custom((value) => {
                if (value <= 0) {
                    throw new Error("Balance cannot be 0 or negative");
                }
                return true;
            }),

    ],
    addDiscount: [
        body("id")
            .exists()
            .withMessage("ID has to be provided")
            .bail()
            .notEmpty()
            .withMessage("ID can not be null")
            .bail()
            .isMongoId()
            .withMessage("Invalid Id"),
        body("discountPercentage")
            .exists()
            .withMessage("Discount Percentage has to be provided")
            .bail()
            .notEmpty()
            .withMessage(" discountPercentage can not be null")
            .bail()
            .isNumeric()
            .withMessage("discountPercentage has to be a number")
            .bail()
            .custom((value) => {
                if (value < 0 || value > 80) {
                    throw new Error("Invalid Discount.Has to be within 0 to 80");
                }
                return true;
            }),
        body("discountStart")
            .exists()
            .withMessage("Start date to be provided")
            .bail()
            .notEmpty()
            .withMessage("StartDate can not be null")
            .bail()
            .isISO8601()
            .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),
        body("discountEnd")
            .exists()
            .withMessage("End date has to be provided")
            .bail()
            .notEmpty()
            .withMessage("StartDate can not be null")
            .bail()
            .isISO8601()
            .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),

    ],
    updateDiscount: [
        query("id")
            .exists()
            .withMessage("ID has to be provided")
            .bail()
            .notEmpty()
            .withMessage("ID can not be null")
            .bail()
            .isMongoId()
            .withMessage("Invalid Id"),
        body("discountPercentage")
            .optional()
            .bail()
            .notEmpty()
            .withMessage(" discountPercentage can not be null")
            .bail()
            .isNumeric()
            .withMessage("discountPercentage has to be a string")
            .bail()
            .custom((value) => {
                if (value < 0 || value > 80) {
                    throw new Error("Invalid Discount.Has to be within 0 to 80");
                }
                return true;
            }),
        body("discountStart")
            .optional()
            .bail()
            .notEmpty()
            .withMessage("StartDate can not be null")
            .bail()
            .isISO8601()
            .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),
        body("discountEnd")
            .optional()
            .bail()
            .notEmpty()
            .withMessage("StartDate can not be null")
            .bail()
            .isISO8601()
            .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),

    ],
    updateProfile: [
        body("name")
            .optional()
            .bail()
            .notEmpty()
            .withMessage("Name can not be null")
            .bail()
            .isString()
            .withMessage("Name has to be a string")
            .bail()
            .isLength({ min: 2, max: 50 })
            .withMessage("Name must be less than 50 characters, and more than 2 characters"),
        body("email")
            .optional()
            .bail()
            .notEmpty()
            .withMessage("Email can not be null")
            .bail()
            .isEmail()
            .withMessage("Invalid Email Address"),
        body("phone")
            .optional()
            .bail()
            .isString()
            .withMessage("Phone number must be a string")
            .bail()
            .matches(/(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/)
            .withMessage("Phone number must be in a valid format"),
    ],
    addReview: [
        body("comment")
            .optional()
            .bail()
            .isString()
            .withMessage("Comment has to be a string")
            .bail()
            .isLength({ min: 2, max: 150 })
            .withMessage("Comment must be less than 150 characters, and more than 2 characters"),
        body("bookId")
            .exists()
            .withMessage("Id has to e provided!")
            .bail()
            .notEmpty()
            .withMessage("Id can not be null")
            .bail()
            .isMongoId()
            .withMessage("Invalid Id has been provided"),
        body("rating")
            .exists()
            .withMessage('Rating has to be provided!')
            .bail()
            .notEmpty()
            .withMessage("Rating can not be null")
            .bail()
            .isNumeric()
            .withMessage("Rating must be a number")
            .bail()
            .custom((value) => {
                if (value <= 0 || value > 5) {
                    throw new Error("Rating has to be greater than 0 and less than or equal 5");
                }
                return true;
            }),

    ],
    deleteReview: [
        query("bookId")
            .exists()
            .withMessage("ID has to be provided")
            .bail()
            .notEmpty()
            .withMessage("ID can not be null")
            .bail()
            .isMongoId()
            .withMessage("Invalid Id"),
    ],
    updateReview: [
        body("comment")
            .optional()
            .bail()
            .isString()
            .withMessage("Comment has to be a string")
            .bail()
            .isLength({ min: 2, max: 150 })
            .withMessage("Comment must be less than 150 characters, and more than 2 characters"),
        body("bookId")
            .exists()
            .withMessage("Id has to e provided!")
            .bail()
            .notEmpty()
            .withMessage("Id can not be null")
            .bail()
            .isMongoId()
            .withMessage("Invalid Id has been provided"),
        body("rating")
            .exists()
            .withMessage("Rating has to be given")
            .bail()
            .notEmpty()
            .withMessage("Rating can not be null")
            .bail()
            .isNumeric()
            .withMessage("Rating must be a number")
            .bail()
            .custom((value) => {
                if (value <= 0 || value > 5) {
                    throw new Error("Rating has to be greater than 0 and less than or equal 5");
                }
                return true;
            }),

    ],
    addBalance: [
        body("balance")
            .exists()
            .withMessage("Balance has to be provided!")
            .bail()
            .notEmpty()
            .withMessage("Balance can not be null")
            .bail()
            .isNumeric()
            .withMessage("Balance has to be a number"),
        body("currency")
            .exists()
            .withMessage("Currency has to be given!")
            .bail()
            .notEmpty()
            .withMessage("Currency can not be null")
            .bail()
            .isString()
            .withMessage("Currency must be a string")


    ],
    resetPassword: [

        body("new_password")
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


    ],
    addToCart:
        [
            body('products')
                .isArray()
                .withMessage('Products must be an array')
                .bail()
                .custom((value) => {
                    const hasInvalidProducts = value.map((product) => {
                        return (
                            typeof product !== 'object' ||
                            !product.hasOwnProperty('p_id') ||
                            !product.hasOwnProperty('quantity')
                        );
                    }).some((invalid) => invalid);

                    if (hasInvalidProducts) {
                        throw new Error('Each product must have p_id and quantity fields');
                    }

                    return true;
                })
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