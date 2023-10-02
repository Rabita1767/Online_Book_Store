//const mangaModelLog = require("../models/model");
const userModel = require("../models/users");
// const orderModel = require("../models/order")
// const transactionModel = require("../models/transactions");
// const reviewModel = require("../models/review");
// const mangaModel = require("../models/products")
const authModel = require("../models/auth")
const bookModel = require("../models/book")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCode");
const { validationResult } = require("express-validator");
const { sendResponse } = require("../util/common");
const log = require("../util/logFile");
//const validate = require("../middleware/validate")
const SECRET_KEY = "myapi";
class Auth {
    async auth(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.CONFLICT, "Signup failed!", validation);
            }
            else {
                const { name, email, password, confirmPassword, phone, role, superAdmin } = req.body;
                const exist = await userModel.findOne({ email: email });
                const phoneExist = await userModel.findOne({ phone: phone });
                console.log(`user ${exist}`);
                if (exist) {
                    //return res.status(400).send(failure("User already exist!"));
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "Email is registered!");
                }
                if (phoneExist) {
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "Phone number is registered");
                }
                if (password != confirmPassword) {
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "Passwords dont match!");
                }
                const hassedPass = await bcrypt.hash(password, 10);
                const hassedConfirmed = await bcrypt.hash(confirmPassword, 10);
                const user = new userModel({ name: name, email: email, phone: phone });
                const addUser = await user.save();
                const authUser = new authModel({ name: name, email: email, password: hassedPass, confirmPassword: hassedConfirmed, user: addUser._id, role: role, superAdmin: superAdmin });
                const savedAuth = await authUser.save();
                //const token = jwt.sign({ email: addUser.email, id: addUser._id, role: addUser.role }, SECRET_KEY, { expiresIn: "1h" });
                // return res.status(200).send(success("Successfully signed up!", { user: savedAuth, token: token }));
                //return res.status(200).send(success("Successfully signed up!", { user: savedAuth }));
                return sendResponse(res, HTTP_STATUS.OK, "Successfully signed up!");
            }

        } catch (error) {
            console.log(error)
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const Userexist = await authModel.findOne({ email: email })
            console.log(Userexist)
            if (!Userexist) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please Sign up first!");
            }
            const pass = await bcrypt.compare(password, Userexist.password);
            console.log(pass)
            if (!pass) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Wrong Credentials");
            }
            const token = jwt.sign({ email: Userexist.email, id: Userexist.user._id, role: Userexist.role, superAdmin: Userexist.superAdmin }, SECRET_KEY, { expiresIn: "1h" });
            console.log(Userexist.user._id);
            console.log(Userexist.role);
            const result = await userModel.findById({ _id: Userexist.user })
                .select("name email balance");
            return sendResponse(res, HTTP_STATUS.OK, "Successfully logged in", { result: result, token: token });
        } catch (error) {
            console.log(error)
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }

    async getAll(req, res) {
        try {
            const { isbn, name, minPrice, maxPrice, category, stock, author, publisher, discount_price, rating, search, sortParam, sortPrice } = req.query;
            const page = req.query.page || 1;
            const limit = req.query.limit || 5;
            const currentDate = new Date();
            const accept = ["isbn", "name", "minPrice", "maxPrice", "category", "stock", "publisher", "rating", "search", "sortParam", "sortPrice"];
            const wrongParam = Object.keys(req.query).filter((x) => !accept.includes(x));
            if (wrongParam.length > 0) {
                return sendResponse(res, HTTP_STATUS.CONFLICT, "Request Invalid!");
            }
            const query = {};
            if (isbn) {
                query.isbn = isbn;
            }
            if (name) {
                if (Array.isArray(name)) {
                    query.name = { $in: name.map(value => new RegExp(value, "i")) }
                }
                else {
                    query.name = { $regex: name, $options: "i" };
                }
            }
            if (minPrice || maxPrice) {
                query.price = {}
                if (minPrice) {
                    query.price.$gte = minPrice;
                }
                if (maxPrice) {
                    query.price.$lte = maxPrice;
                }

            }
            if (category) {
                query.category = { $regex: category, $options: "i" }
            }
            if (stock) {
                query.stock = { $gte: stock };
            }
            if (author) {
                query.author = { $regex: author, $options: "i" };
            }
            if (publisher) {
                query.publisher = { $regex: publisher, $options: "i" }
            }
            if (rating) {
                query.rating = { $gte: rating };
            }
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { category: { $regex: search, $options: "i" } },
                    { publisher: { $regex: search, $options: "i" } },
                    { author: { $regex: search, $options: "i" } },

                ];
            }
            let sortOptions = {};

            if (sortParam && sortPrice) {
                if (sortParam === "price" && (sortPrice === "asc" || sortPrice === "desc")) {
                    sortOptions[sortParam] = sortPrice === "asc" ? 1 : -1;
                    console.log(sortOptions)
                    console.log(sortOptions[sortParam])
                }
                else if (sortParam === "rating" && (sortPrice === "asc" || sortPrice === "desc")) {
                    sortOptions[sortParam] = sortPrice === "asc" ? 1 : -1;
                    console.log(sortOptions)
                    console.log(sortOptions[sortParam])
                }

            }
            const skipContent = (parseInt(page) - 1) * parseInt(limit);
            const book = await bookModel.find(query);
            const filterResult = await bookModel.find(query)
                .populate("review")
                .sort(sortOptions)
                .skip(skipContent)
                .limit(limit);
            if (filterResult.length == 0) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No Book Found!");
            }
            return sendResponse(res, HTTP_STATUS.OK, "Data Fetched Successfully", filterResult);
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "internal Server Error!");
        }
    }
    async url(req, res) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "URL not found!");
    }
    // async discountGetAll(req, res) {
    //     try {
    //         const book=await bookModel.find({});


    //     } catch (error) {
    //         console.log(error);
    //         return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
    //     }
    // }


}
module.exports = new Auth()