const userModel = require("../models/users");
const bookModel = require("../models/book");
const cartModel = require("../models/cart");
const transactionModel = require("../models/transaction");
const discountModel = require("../models/discount");
const authModel = require("../models/auth");
const reviewModel = require("../models/review");
const orderModel = require("../models/order")
const { sendResponse } = require("../util/common");
const log = require("../util/logFile");
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCode");
class cart {
    async cart(req, res) {
        try {
            log.createLogFile("/cart/addToCart", "Success");
            const currentDate = new Date();
            const { products } = req.body;
            const [{ p_id, quantity }] = products;
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the review", validation);
            }
            if (quantity <= 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Cant add item!");
            }
            const findProduct = await bookModel.findById({ _id: p_id });
            const findUser = await userModel.findById({ _id: req.userId })
            console.log(req.userId)
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign up!");
            }
            const findCart = await cartModel.findOne({ user: req.userId })
            if (!findCart) {
                if (findProduct.stock < quantity) {
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "Not enough stock!");
                }
                let total = 0;
                const createCart = new cartModel({
                    user: req.userId, products: products
                })
                if (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd) {
                    console.log(`discount ${findProduct.discountEnd}`)
                    console.log(`date ${currentDate}`)
                    findProduct.price -= (findProduct.price * (findProduct.discountPercentage / 100));
                    total += quantity * findProduct.price;
                    console.log(`total: ${total}`)
                    createCart.totalPrice = total;
                    console.log(`cart total: ${createCart.totalPrice}`)
                    createCart.save();
                    return sendResponse(res, HTTP_STATUS.OK, "New cart has been created", createCart);
                }
                total += quantity * findProduct.price;
                console.log(`total: ${total}`)
                createCart.totalPrice = total;
                console.log(`cart total: ${createCart.totalPrice}`)
                await createCart.save();
                return sendResponse(res, HTTP_STATUS.OK, "New cart has been created", createCart);
            }
            else {
                // const exist = await cartModel.findOne({ "products.p_id": p_id });
                const exist = await cartModel.findOne({
                    $and: [
                        { "products.p_id": p_id },
                        { user: req.userId } // Assuming req.userId holds the user information
                    ]
                });
                //const productFound = exist.products.filter((x) => x.p_id == p_id);
                if (exist) {

                    const updatedCart = await cartModel.findOneAndUpdate(
                        { "products.p_id": p_id },
                        { $inc: { "products.$.quantity": quantity } },
                        { new: true }
                    );
                    const result = updatedCart.products.find((x) => x.p_id == p_id)
                    if (result.quantity <= findProduct.stock) {
                        if (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd) {
                            findProduct.price -= (findProduct.price * (findProduct.discountPercentage / 100));
                            updatedCart.totalPrice += quantity * findProduct.price;
                            await updatedCart.save();
                            return sendResponse(res, HTTP_STATUS.OK, "Cart has been updated", updatedCart);

                        }
                        updatedCart.totalPrice += quantity * findProduct.price;
                        await updatedCart.save();
                        //return res.status(200).send(success("updated", updatedCart))
                        return sendResponse(res, HTTP_STATUS.OK, "Cart has been updated", updatedCart);
                    }
                    const decrease = await cartModel.findOneAndUpdate(
                        { "products.p_id": p_id },
                        { $inc: { "products.$.quantity": -quantity } },
                        { new: true }
                    );
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "Can't add item not enough stock!", decrease);

                }
                if (quantity <= findProduct.stock) {
                    findCart.products.push({ p_id, quantity });
                    if (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd) {
                        findProduct.price -= findProduct.price * (findProduct.discountPercentage / 100);
                        findCart.totalPrice += quantity * findProduct.price;
                        findCart.save();
                        return sendResponse(res, HTTP_STATUS.OK, "Added item to the cart!", findCart);
                    }
                    findCart.totalPrice += quantity * findProduct.price;
                    findCart.save();

                    return sendResponse(res, HTTP_STATUS.OK, "Added item to the cart!", findCart);
                }
            }


            return sendResponse(res, HTTP_STATUS.CONFLICT, "Cant add item!Not enough stock!");
        } catch (error) {
            log.createLogFile("/cart/addToCart", "Failure")
            console.log(error);
            // return res.status(500).send(failure("Internal Server Error!"));
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }

    async removeItem(req, res) {
        try {
            const { products } = req.body;
            console.log(req.body);

            const [{ p_id, quantity }] = products;
            console.log(products);
            const currentDate = new Date();
            const findUser = await userModel.findById({ _id: req.userId });
            if (!findUser) {
                return sendResponse(res, HTTP.HTTP_STATUS.NOT_FOUND, "Sign in!");
            }
            const findCart = await cartModel.findOne({ user: req.userId });
            if (!findCart) {
                return sendResponse(res, HTTP.HTTP_STATUS.NOT_FOUND, "Create A cart first");
            }
            if (findCart.products.length == 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Your cart is empty!");
            }
            findCart.products.find((x) => {
                if (x.p_id == p_id) {
                    if (x.quantity > quantity) {
                        x.quantity -= quantity;
                    }
                    else if (x.quantity == quantity) {
                        const index = findCart.products.findIndex((x) => x.p_id == p_id);
                        findCart.products.splice(index, 1);
                    }
                    else if (x.quantity < quantity) {
                        return sendResponse(res, HTTP.HTTP_STATUS.UNPROCESSABLE_ENTITY, "Invalid Request!");
                    }
                }
            })
            const productIds = findCart.products.map((x) => x.p_id)
            const findDiscount = await discountModel.find({ productId: { $in: productIds } });
            let total = 0;
            findCart.products.map((x) => {
                findDiscount.map((y) => {
                    console.log(`initial ${total}`)
                    if (x.p_id.toString() == y.productId.toString()) {
                        console.log(` ${total}`)
                        if (currentDate >= y.discountStart && currentDate <= y.discountEnd) {
                            total += y.discountPrice * x.quantity;
                            console.log(`total ${total}`)
                        }
                        else {
                            total += y.price * x.quantity;
                            console.log(`total1 ${total}`)
                        }
                    }
                })
            })
            findCart.totalPrice = total;
            await findCart.save();
            return sendResponse(res, HTTP_STATUS.OK, "Removed Item Successfully")

        } catch (error) {
            console.log(error)
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }

    async viewCart(req, res) {
        try {
            let flag = false;
            log.createLogFile("/cart/viewCart", "Success")
            const currentDate = new Date();
            const findUser = await userModel.findById({ _id: req.userId });
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in!");
            }
            const findCart = await cartModel.findOne({ user: req.userId })
            if (!findCart) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Cart not found!");
            }
            if (findCart.status == false) {
                let total = 0;
                const productIds = findCart.products.map(x => x.p_id);
                console.log(`product id ${productIds}`);
                const findProduct = await bookModel.find({ _id: { $in: productIds } });
                console.log(`matched product from book model ${findProduct}`);
                findCart.products.map((x) => {
                    console.log(`product id ${x.p_id}`)
                    findProduct.map((item) => {
                        console.log(`item ${item._id}`)
                        if (item._id.toString() == x.p_id.toString()) {
                            if (currentDate > item.discountEnd || currentDate < item.discountStart) {
                                total += item.price * x.quantity;
                                console.log(`total ${total}`)
                                findCart.totalPrice = total;
                                console.log(`find ${findCart.totalPrice}`)
                                // findCart.save();
                                flag = true;
                                // return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findCart);
                            }
                            let updatedPrice = item.price;//12.99
                            updatedPrice -= updatedPrice * (item.discountPercentage / 100);//12.99-(12.99X0.02)
                            total += updatedPrice * x.quantity;
                            findCart.totalPrice = total;
                            // findCart.save();
                            flag = true;
                            // return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findCart);
                        }
                    })
                })
                if (flag) {
                    await findCart.save();
                    return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findCart);
                }
            }

        } catch (error) {
            log.createLogFile("/cart/viewCart", "Failure")
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }


    async checkout(req, res) {
        try {
            const flag = false;
            const currentDate = new Date();
            const findUser = await userModel.findById({ _id: req.userId });
            const findAAuthUser = await authModel.findOne({ user: req.userId });
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Sign in");
            }
            const findCart = await cartModel.findOne({ user: req.userId })
            const findTransaction = await transactionModel.findOne({ user: req.userId });
            const productIds = findCart.products.map((x) => x.p_id)
            const findProduct = await bookModel.find({ _id: { $in: productIds } })
            const findDiscount = await discountModel.find({ productId: { $in: productIds } });
            let checkoutSuccessful = true;
            findCart.products.map((x) => {
                findProduct.map((y) => {
                    if (x.quantity > y.stock) {
                        checkoutSuccessful = false;
                    }
                })
            })
            if (!checkoutSuccessful) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Checkout unsuccessful.Not enough stock")
            }
            let total = 0;
            findCart.products.map((x) => {
                findDiscount.map((y) => {
                    console.log(`initial ${total}`)
                    if (x.p_id.toString() == y.productId.toString()) {
                        console.log(` ${total}`)
                        if (currentDate >= y.discountStart && currentDate <= y.discountEnd) {
                            total += y.discountPrice * x.quantity;
                            console.log(`yoo ${total}`)
                        }
                        else {
                            total += y.price * x.quantity;
                            console.log(`total1 ${total}`)
                        }
                    }
                })
            })
            if (total < findUser.balance) {
                if (!findTransaction) {
                    const createTransaction = new transactionModel({
                        cart: findCart._id, user: findCart.user, products: findCart.products, totalPrice: total
                    })
                    await createTransaction.save();
                    findUser.balance -= createTransaction.totalPrice;
                    findAAuthUser.balance = findUser.balance;
                    // await findUser.save();
                    findCart.products.map(async (x) => {
                        findProduct.map(async (y) => {
                            if (x.p_id.toString() == y._id.toString()) {
                                y.stock -= x.quantity
                                await y.save();
                            }
                        })
                    })
                    findCart.products = [];
                    findCart.totalPrice = 0;
                    await findCart.save();
                    const order = new orderModel({
                        user: req.userId, products: createTransaction.products, cart: findCart._id, totalPrice: createTransaction.totalPrice
                    })
                    await order.save();
                    findUser.order.push(order._id);
                    await findUser.save();
                    await findAAuthUser.save();
                    return sendResponse(res, HTTP_STATUS.OK, "Checkout Successful", createTransaction);
                }
                const updatedCart = await transactionModel.findOneAndUpdate(
                    { "user": req.userId },
                    { $set: { products: findCart.products, totalPrice: total } },
                    { new: true }
                );
                findUser.balance -= updatedCart.totalPrice;
                findAAuthUser.balance = findUser.balance;
                // await findUser.save();
                findCart.products.map(async (x) => {
                    findProduct.map(async (y) => {
                        if (x.p_id.toString() == y._id.toString()) {
                            y.stock -= x.quantity
                            await y.save();
                        }
                    })
                })
                findCart.products = [];
                findCart.totalPrice = 0;
                await findCart.save();
                const order = new orderModel({
                    user: req.userId, products: updatedCart.products, cart: findCart._id, totalPrice: updatedCart.totalPrice
                })
                await order.save();
                findUser.order.push(order._id);
                await findUser.save()
                await findAAuthUser.save();
                return sendResponse(res, HTTP_STATUS.OK, "Checkout Successful", updatedCart);
            }
            return sendResponse(res, HTTP_STATUS.CONFLICT, "Not enough balance!")





        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!")
        }
    }



}
module.exports = new cart();