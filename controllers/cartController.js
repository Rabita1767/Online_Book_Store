const userModel = require("../models/users");
const bookModel = require("../models/book");
const cartModel = require("../models/cart");
const transactionModel = require("../models/transaction");
const discountModel = require("../models/discount");
const authModel = require("../models/auth");
const reviewModel = require("../models/review");
const orderModel = require("../models/order")
const { sendResponse } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCode");
class cart {
    async cart(req, res) {
        try {
            const currentDate = new Date();
            const { products } = req.body;
            const [{ p_id, quantity }] = products;
            const findProduct = await bookModel.findById({ _id: p_id });
            const findUser = await userModel.findById({ _id: req.userId })
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
                createCart.save();
                return sendResponse(res, HTTP_STATUS.OK, "New cart has been created", createCart);
            }
            const exist = await cartModel.findOne({ "products.p_id": p_id });
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

            return sendResponse(res, HTTP_STATUS.CONFLICT, "Cant add item!Not enough stock!");
        } catch (error) {
            console.log(error);
            // return res.status(500).send(failure("Internal Server Error!"));
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    async removeItem(req, res) {
        try {
            const { products } = req.body;
            const [{ p_id, quantity }] = products;
            const currentDate = new Date();
            console.log(`date ${currentDate}`)
            const findUser = await userModel.findById({ _id: req.userId })
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign up first");
            }
            const findCart = await cartModel.findOne({ user: req.userId })
            const findProduct = await bookModel.findOne({ _id: p_id });
            if (!findCart) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Cart not found!");
            }
            if (findCart.products.length == 0) {
                return sendResponse(res, HTTP_STATUS.CONFLICT, "Your cart is empty!");
            }
            const findItem = findCart.products.find((x) => {
                if (x.p_id == p_id) {
                    if (quantity > x.quantity) {
                        return sendResponse(res, HTTP_STATUS.CONFLICT, `Cant remove more than ${x.quantity} items`);
                    }
                    else if (quantity == x.quantity) {
                        const index = findCart.products.findIndex((x) => x.p_id == p_id);
                        findCart.products.splice(index, 1);
                        if (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd) {
                            findProduct.price -= (findProduct.price * (findProduct.discountPercentage / 100));
                            findCart.totalPrice -= quantity * findProduct.price;
                            findCart.save();
                            //return res.status(200).send(success("Successfully deleted item", findCart));
                            return sendResponse(res, HTTP_STATUS.OK, "Successfully deleted item", findCart);
                        }
                        findCart.totalPrice -= quantity * findProduct.price;
                        findCart.save();
                        //return res.status(200).send(success("Successfully deleted item", findCart));
                        return sendResponse(res, HTTP_STATUS.OK, "Successfully deleted item", findCart);
                    }
                    x.quantity -= quantity;
                    if (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd) {
                        findProduct.price -= (findProduct.price * (findProduct.discountPercentage / 100));
                        indCart.totalPrice -= quantity * findProduct.price;
                        findCart.save();
                        //return res.status(200).send(success("Successfully deleted", findCart));
                        return sendResponse(res, HTTP_STATUS.OK, "Successfully deleted", findCart);
                    }
                    findCart.totalPrice -= quantity * findProduct.price;
                    findCart.save();
                    //return res.status(200).send(success("Successfully deleted", findCart));
                    return sendResponse(res, HTTP_STATUS.OK, "Successfully deleted", findCart);
                }
            })
        } catch (error) {
            console.log(error)
            //return res.status(500).send(failure("Internal Server error!"));
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }

    async viewCart(req, res) {
        try {
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
                                findCart.save();
                                return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findCart);
                            }
                            let updatedPrice = item.price;//12.99
                            updatedPrice -= updatedPrice * (item.discountPercentage / 100);//12.99-(12.99X0.02)
                            total += updatedPrice * x.quantity;
                            findCart.totalPrice = total;
                            findCart.save();
                            return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findCart);

                        }
                    })
                })

            }

        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }

    async checkout(req, res) {
        try {
            const currentDate = new Date();
            const findUser = await userModel.findById({ _id: req.userId });
            if (!findUser) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in!");
            }
            const findCart = await cartModel.findOne({ user: req.userId });
            if (!findCart) {
                return sendResponse(res, HTTP_STATUS.CONFLICT, "Cart not found!");
            }
            const findTransaction = await transactionModel.findOne({ user: req.userId });
            const productIds = findCart.products.map(x => x.p_id);
            const findDiscount = await discountModel.find({
                productId
                    : { $in: productIds }
            });
            if (!findTransaction) {
                const result = new transactionModel({
                    cart: findCart._id, user: findCart.user, products: findCart.products
                })
                let total = 0;
                findCart.products.map(async (x) => {
                    findDiscount.map(async (item) => {
                        if (item.productId.toString() == x.p_id.toString()) {
                            if (currentDate >= item.discountStart && currentDate <= item.discountEnd) {
                                total += item.discountPrice * x.quantity;
                            }
                            else {
                                total += item.price * x.quantity;
                            }
                        }
                    })
                })
                result.totalPrice = total;
                if (result.totalPrice > findUser.balance) {
                    return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Checkout unsuccessful!Not enough balance!");
                }
                const findProduct = await bookModel.find({
                    _id
                        : { $in: productIds }
                });
                findCart.products.map(async (x) => {
                    findProduct.map(async (item) => {
                        if (item._id.toString() == x.p_id.toString()) {
                            if (item.stock < x.quantity) {
                                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Checkput unsuccessful.Not enough stock!")
                            }
                            item.stock -= x.quantity;
                            console.log(`stock ${item.stock}`)
                            await item.save();
                            await result.save();
                            findUser.balance -= result.totalPrice;
                            findUser.order.push(result._id);
                            await findUser.save();
                            findCart.products = [];
                            findCart.totalPrice = 0;
                            await findCart.save();
                            return sendResponse(res, HTTP_STATUS.OK, "Successfully check out!", result)
                        }
                    })
                })
                // await result.save();
                // findUser.balance -= result.totalPrice;
                // await findUser.save();
                // return sendResponse(res, HTTP_STATUS.OK, "Successfully check out!", result)
            }
            else {
                let total = 0;
                findCart.products.map(async (x) => {
                    findDiscount.map(async (item) => {
                        if (item.productId.toString() == x.p_id.toString()) {
                            if (currentDate >= item.discountStart && currentDate <= item.discountEnd) {
                                total += item.discountPrice * x.quantity;
                            }
                            else {
                                total += item.price * x.quantity;
                            }
                        }
                    })
                })
                findTransaction.totalPrice = total;
                if (findTransaction.totalPrice > findUser.balance) {
                    return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Checkout unsuccessful!Not enough balance!");
                }
                findTransaction.products = findCart.products;
                const findProduct = await bookModel.find({
                    _id
                        : { $in: productIds }
                });
                findCart.products.map(async (x) => {
                    findProduct.map(async (item) => {
                        if (item._id.toString() == x.p_id.toString()) {
                            if (item.stock < x.quantity) {
                                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Checkput unsuccessful.Not enough stock!")
                            }
                            item.stock -= x.quantity;
                            console.log(`stock ${item.stock}`)
                            await item.save();
                            await findTransaction.save();
                            findUser.balance -= findTransaction.totalPrice;
                            findUser.order.push(findTransaction._id);
                            await findUser.save();
                            findCart.products = [];
                            findCart.totalPrice = 0;
                            await findCart.save();
                            return sendResponse(res, HTTP_STATUS.OK, "Successfully check out!", findTransaction)
                        }
                    })
                })
                // await findTransaction.save();
                // findUser.balance -= findTransaction.totalPrice;
                // await findUser.save();
                // return sendResponse(res, HTTP_STATUS.OK, "Successfully check out!", findTransaction)
            }
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }


}
module.exports = new cart();