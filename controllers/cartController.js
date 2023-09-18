const userModel = require("../models/users");
const bookModel = require("../models/book");
const cartModel = require("../models/cart");
const transactionModel = require("../models/transaction");
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
                    //return res.status(200).send(success("New cart has been created", createCart))
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
    // async checkout(req, res) {
    //     try {
    //         const { id } = req.body
    //         const currentDate = new Date();
    //         const findUser = await userModel.findById({ _id: req.userId })
    //         const findAuth = await authModel.findOne({ user: req.userId });
    //         if (!findUser) {
    //             return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in");
    //         }
    //         const findTransaction = await transactionModel.findOne({ user: req.userId });
    //         const findCart = await cartModel.findOne({ user: req.userId });
    //         if (!findCart) {
    //             return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No cart found!");
    //         }
    //         if (findUser.balance < findCart.totalPrice) {
    //             return sendResponse(res, HTTP_STATUS.CONFLICT, "Faied to checkout.Not enough balance!");
    //         }
    //         if (!findTransaction) {
    //             if (findCart.products.length == 0) {
    //                 return sendResponse(res, HTTP_STATUS.CONFLICT, "Your cart is empty!Please add some products!");
    //             }
    //             const checkout = new transactionModel({
    //                 user: req.userId, products: findCart.products, cart: findCart._id, totalPrice: findCart.totalPrice
    //             })

    //             findCart.products.map(async (x) => {
    //                 const findProduct = await bookModel.findOne({ _id: x.p_id })
    //                 if (findProduct.stock < x.quantity) {
    //                     return sendResponse(res, HTTP_STATUS.CONFLICT, "Checkout failed!Not enough stock");
    //                 }
    //                 if (findCart.createdAt < findProduct.discountStart && (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd)) {
    //                     findProduct.price -= findProduct.price * (findProduct.discountPercentage / 10);
    //                     findCart.totalPrice += findProduct.price * x.quantity;
    //                     checkout.totalPrice = findCart.totalPrice;
    //                     await checkout.save();
    //                     findCart.products = [];
    //                     findCart.totalPrice = 0;
    //                     await findCart.save();
    //                     findProduct.stock -= x.quantity;
    //                     await findProduct.save();
    //                     const order = new orderModel({
    //                         user: req.userId, products: checkout.products, cart: findCart._id, totalPrice: checkout.totalPrice
    //                     })
    //                     await order.save();
    //                     findUser.order.push(order._id);
    //                     findUser.balance -= checkout.totalPrice;
    //                     await findUser.save();
    //                     findAuth.balance = findUser.balance;
    //                     await findAuth.save();
    //                     return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", checkout)
    //                 }
    //                 else if ((findCart.createdAt >= findProduct.discountStart && findCart.createdAt <= findProduct.discountEnd) && (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd)) {
    //                     await checkout.save();
    //                     findCart.products = [];
    //                     findCart.totalPrice = 0;
    //                     await findCart.save();
    //                     findProduct.stock -= x.quantity;
    //                     await findProduct.save();
    //                     const order = new orderModel({
    //                         user: req.userId, products: checkout.products, cart: findCart._id, totalPrice: checkout.totalPrice
    //                     })
    //                     await order.save();
    //                     findUser.order.push(order._id);
    //                     findUser.balance -= checkout.totalPrice;
    //                     await findUser.save();
    //                     findAuth.balance = findUser.balance;
    //                     await findAuth.save();
    //                     return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", checkout)
    //                 }
    //                 else {
    //                     await checkout.save();
    //                     findCart.products = [];
    //                     findCart.totalPrice = 0;
    //                     await findCart.save();
    //                     findProduct.stock -= x.quantity;
    //                     await findProduct.save();
    //                     const order = new orderModel({
    //                         user: req.userId, products: checkout.products, cart: findCart._id, totalPrice: checkout.totalPrice
    //                     })
    //                     await order.save();
    //                     findUser.order.push(order._id);
    //                     findUser.balance -= checkout.totalPrice;
    //                     await findUser.save();
    //                     findAuth.balance = findUser.balance;
    //                     await findAuth.save();
    //                     return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", checkout)
    //                 }

    //             })
    //         }
    //         if (findCart.products.length == 0) {
    //             return sendResponse(res, HTTP_STATUS.CONFLICT, "Your cart is empty!Please add some products!")
    //         }
    //         findCart.products.map(async (x) => {
    //             const findProduct = await bookModel.findOne({ _id: x.p_id })
    //             if (findProduct.stock < x.quantity) {
    //                 return sendResponse(res, HTTP_STATUS.CONFLICT, "Checkout failed!Not enough stock")
    //             }
    //             if (findCart.createdAt < findProduct.discountStart && (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd)) {
    //                 findProduct.price -= findProduct.price * (findProduct.discountPercentage / 10);
    //                 findCart.totalPrice += findProduct.price * x.quantity;
    //                 const updatedCart = await transactionModel.findOneAndUpdate(
    //                     { "user": req.userId },
    //                     { $set: { products: findCart.products, totalPrice: findCart.totalPrice } },
    //                     { new: true }
    //                 );
    //                 console.log(`here ${updatedCart.products}`);
    //                 const order = new orderModel({
    //                     user: req.userId, products: updatedCart.products, cart: findCart._id, totalPrice: updatedCart.totalPrice
    //                 })
    //                 await order.save();
    //                 findUser.order.push(order._id);
    //                 findUser.balance -= order.totalPrice;
    //                 await findUser.save();
    //                 findAuth.balance = findUser.balance;
    //                 await findAuth.save();
    //                 findCart.products = [];
    //                 findCart.totalPrice = 0;
    //                 await findCart.save();
    //                 findProduct.stock -= x.quantity;
    //                 await findProduct.save();
    //                 return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", updatedCart)

    //             }
    //             else if ((findCart.createdAt >= findProduct.discountStart && findCart.createdAt <= findProduct.discountEnd) && (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd)) {
    //                 const updatedCart = await transactionModel.findOneAndUpdate(
    //                     { "user": req.userId },
    //                     { $set: { products: findCart.products, totalPrice: findCart.totalPrice } },
    //                     { new: true }
    //                 );
    //                 //console.log(`here ${updatedCart.products}`);
    //                 const order = new orderModel({
    //                     user: req.userId, products: updatedCart.products, cart: findCart._id, totalPrice: updatedCart.totalPrice
    //                 })
    //                 await order.save();
    //                 findUser.order.push(order._id);
    //                 findUser.balance -= order.totalPrice;
    //                 await findUser.save();
    //                 findAuth.balance = findUser.balance;
    //                 await findAuth.save();
    //                 findCart.products = [];
    //                 findCart.totalPrice = 0;
    //                 await findCart.save();
    //                 findProduct.stock -= x.quantity;
    //                 await findProduct.save();
    //                 return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", updatedCart)
    //             }
    //             else {
    //                 const updatedCart = await transactionModel.findOneAndUpdate(
    //                     { "user": req.userId },
    //                     { $set: { products: findCart.products, totalPrice: findCart.totalPrice } },
    //                     { new: true }
    //                 );
    //                 console.log(`here ${updatedCart.products}`);
    //                 const order = new orderModel({
    //                     user: req.userId, products: updatedCart.products, cart: findCart._id, totalPrice: updatedCart.totalPrice
    //                 })
    //                 await order.save();
    //                 findUser.order.push(order._id);
    //                 findUser.balance -= order.totalPrice;
    //                 await findUser.save();
    //                 findAuth.balance = findUser.balance;
    //                 await findAuth.save();
    //                 findCart.products = [];
    //                 findCart.totalPrice = 0;
    //                 await findCart.save();
    //                 findProduct.stock -= x.quantity;
    //                 await findProduct.save();
    //                 return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", updatedCart)
    //             }


    //         })

    //     } catch (error) {
    //         console.log(error);
    //         return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal Server Error!')
    //     }
    // }
    // async checkout(req, res) {
    //     try {
    //         const { id } = req.body
    //         const currentDate = new Date();
    //         const findUser = await userModel.findById({ _id: req.userId })
    //         const findAuth = await authModel.findOne({ user: req.userId });
    //         if (!findUser) {
    //             return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in");
    //         }
    //         const findTransaction = await transactionModel.findOne({ user: req.userId });
    //         const findCart = await cartModel.findOne({ user: req.userId });
    //         if (!findCart) {
    //             return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No cart found!");
    //         }
    //         if (findUser.balance < findCart.totalPrice) {
    //             return sendResponse(res, HTTP_STATUS.CONFLICT, "Faied to checkout.Not enough balance!");
    //         }
    //         if (!findTransaction) {
    //             if (findCart.products.length == 0) {
    //                 return sendResponse(res, HTTP_STATUS.CONFLICT, "Your cart is empty!Please add some products!");
    //             }
    //             const checkout = new transactionModel({
    //                 user: req.userId, products: findCart.products, cart: findCart._id, totalPrice: findCart.totalPrice
    //             })

    //             findCart.products.map(async (x) => {
    //                 const findProduct = await bookModel.findOne({ _id: x.p_id })
    //                 if (findProduct.stock < x.quantity) {
    //                     return sendResponse(res, HTTP_STATUS.CONFLICT, "Checkout failed!Not enough stock");
    //                 }
    //                 if (findCart.createdAt < findProduct.discountStart && (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd)) {
    //                     findProduct.price -= (findProduct.price * (findProduct.discountPercentage / 10));
    //                     console.log(`price ${findProduct.price}`)
    //                     findCart.totalPrice += findProduct.price * x.quantity;
    //                     console.log(`Totalprice ${findCart.totalPrice}`)
    //                     await findCart.save();
    //                     checkout.totalPrice = findCart.totalPrice;
    //                     await checkout.save();
    //                     findCart.products = [];
    //                     findCart.totalPrice = 0;
    //                     await findCart.save();
    //                     findProduct.stock -= x.quantity;
    //                     await findProduct.save();
    //                     const order = new orderModel({
    //                         user: req.userId, products: checkout.products, cart: findCart._id, totalPrice: checkout.totalPrice
    //                     })
    //                     await order.save();
    //                     findUser.order.push(order._id);
    //                     findUser.balance -= checkout.totalPrice;
    //                     await findUser.save();
    //                     findAuth.balance = findUser.balance;
    //                     await findAuth.save();
    //                     return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", checkout)
    //                 }
    //                 await checkout.save();
    //                 findCart.products = [];
    //                 findCart.totalPrice = 0;
    //                 await findCart.save();
    //                 findProduct.stock -= x.quantity;
    //                 await findProduct.save();
    //                 const order = new orderModel({
    //                     user: req.userId, products: checkout.products, cart: findCart._id, totalPrice: checkout.totalPrice
    //                 })
    //                 await order.save();
    //                 findUser.order.push(order._id);
    //                 findUser.balance -= checkout.totalPrice;
    //                 await findUser.save();
    //                 findAuth.balance = findUser.balance;
    //                 await findAuth.save();
    //                 return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", checkout)
    //             })
    //         }
    //         if (findCart.products.length == 0) {
    //             return sendResponse(res, HTTP_STATUS.CONFLICT, "Your cart is empty!Please add some products!")
    //         }
    //         findCart.products.map(async (x) => {
    //             const findProduct = await bookModel.findOne({ _id: x.p_id })
    //             if (findProduct.stock < x.quantity) {
    //                 return sendResponse(res, HTTP_STATUS.CONFLICT, "Checkout failed!Not enough stock")
    //             }
    //             const updatedCart = await transactionModel.findOneAndUpdate(
    //                 { "user": req.userId },
    //                 { $set: { products: findCart.products, totalPrice: findCart.totalPrice } },
    //                 { new: true }
    //             );
    //             //console.log(`here ${updatedCart.products}`);
    //             const order = new orderModel({
    //                 user: req.userId, products: updatedCart.products, cart: findCart._id, totalPrice: updatedCart.totalPrice
    //             })
    //             await order.save();
    //             findUser.order.push(order._id);
    //             findUser.balance -= order.totalPrice;
    //             await findUser.save();
    //             findAuth.balance = findUser.balance;
    //             await findAuth.save();
    //             findCart.products = [];
    //             findCart.totalPrice = 0;
    //             await findCart.save();
    //             findProduct.stock -= x.quantity;
    //             await findProduct.save();
    //             return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", updatedCart)
    //         })

    //     } catch (error) {
    //         console.log(error);
    //         return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal Server Error!')
    //     }
    // }
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
    // async viewCart(req, res) {
    //     try {
    //         const currentDate = new Date();
    //         const findUser = await userModel.findById({ _id: req.userId });
    //         if (!findUser) {
    //             return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign in!");
    //         }
    //         const findCart = await cartModel.findOne({ user: req.userId });
    //         if (!findCart) {
    //             return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Cart not found!");
    //         }
    //         if (findCart.status == false) {
    //             let total = 0;
    //             const productIds = findCart.products.map(x => x.p_id);
    //             console.log(`product ids: ${productIds}`);
    //             const findProducts = await bookModel.find({ _id: { $in: productIds } });
    //             console.log(`matched products from book model: ${findProducts}`);

    //             for (const cartProduct of findCart.products) {
    //                 const matchingProduct = findProducts.find(product => product._id == cartProduct.p_id);
    //                 if (matchingProduct) {
    //                     if (currentDate > matchingProduct.discountEnd || currentDate < matchingProduct.discountStart) {
    //                         console.log(`no discount applied`);
    //                         total += matchingProduct.price * cartProduct.quantity;
    //                         findCart.totalPrice = total;
    //                         await findCart.save();
    //                         return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findCart);
    //                     } else {
    //                         console.log(`discount applied`);
    //                         let updatedPrice = matchingProduct.price;
    //                         updatedPrice -= updatedPrice * (matchingProduct.discountPercentage / 100);
    //                         total += updatedPrice * cartProduct.quantity;
    //                         findCart.totalPrice = total;
    //                         await findCart.save();
    //                         return sendResponse(res, HTTP_STATUS.OK, "Successfully fetched data", findCart);
    //                     }
    //                 }
    //             }




    //         }
    //     } catch (error) {
    //         console.log(error);
    //         return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
    //     }
    // }

    // async checkout(req, res) {
    //     const currentDate = new Date();
    //     const findUser = await userModel.findById({ _id: req.userId });
    //     const findAuth = await authModel.findOne({ user: req.userId });
    //     if (!findUser) {
    //         return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Please sign up!");
    //     }
    //     const findCart = await cartModel.findOne({ user: req.userId });
    //     if (!findCart) {
    //         return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Add cart!");
    //     }
    //     const findTransaction = await transactionModel.findOne({ user: req.userId });
    //     if (!findTransaction) {
    //         const checkout = new transactionModel({
    //             cart: findCart._id, user: findCart.user, products: findCart.products
    //         })
    //         findCart.products.map(async (x) => {
    //             const findProduct = await bookModel.findOne({ _id: x.p_id })
    //             console.log(findProduct)
    //             console.log(`yoo ${findProduct.stock}`);
    //             console.log(`yooooo ${x.quantity}`)
    //             if (findProduct.stock < x.quantity) {
    //                 return sendResponse(res, HTTP_STATUS.CONFLICT, "Checkout failed!Not enough stock");
    //             }
    //             if (currentDate >= findProduct.discountStart && currentDate <= findProduct.discountEnd) {
    //                 const updatedPrice = findProduct.price - (findProduct.price * (findProduct.discountPercentage / 100));
    //                 console.log(`price ${findProduct.price}`)
    //                 checkout.totalPrice += updatedPrice * x.quantity;
    //                 if (findUser.balance < checkout.totalPrice) {
    //                     return sendResponse(res, HTTP_STATUS.CONFLICT, "Checkout failed!Please add balance to your wallet!");
    //                 }
    //                 await checkout.save();
    //                 findCart.products = [];
    //                 findCart.totalPrice = 0;
    //                 await findCart.save();
    //                 findUser.balance -= checkout.totalPrice;
    //                 await findUser.save();
    //                 findAuth.balance = findUser.balance;
    //                 await findAuth.save();
    //                 findProduct.stock -= x.quantity;
    //                 await findProduct.save();
    //                 console.log(`whyy ${updatedPrice}`)
    //                 return sendResponse(res, HTTP_STATUS.OK, "Added checkout", checkout);
    //             }
    //             checkout.totalPrice += findProduct.price * x.quantity;
    //             if (findUser.balance < checkout.totalPrice) {
    //                 return sendResponse(res, HTTP_STATUS.CONFLICT, "Checkout failed!Please add balance to your wallet!");
    //             }
    //             await checkout.save();
    //             findCart.products = [];
    //             findCart.totalPrice = 0;
    //             await findCart.save();
    //             findUser.balance -= checkout.totalPrice;
    //             await findUser.save();
    //             findAuth.balance = findUser.balance;
    //             await findAuth.save();
    //             findProduct.stock -= x.quantity;
    //             await findProduct.save();
    //             return sendResponse(res, HTTP_STATUS.OK, "Added doneee", checkout);
    //         })
    //     }
    // }
    async checkout(req, res) {
        try {
            const { id } = req.body
            const findUser = await userModel.findById({ _id: req.userId })
            if (!findUser) {
                return res.status(400).send(failure("Please log in!"));
            }
            const findTransaction = await transactionModel.findOne({ user: req.userId });
            const findCart = await cartModel.findOne({ user: req.userId });
            if (!findTransaction) {
                if (findCart.products.length == 0) {
                    // return res.status(400).send(failure("Your cart is empty!Please add some products!"));
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "Your cart is empty!Please add some products!");
                }
                const checkout = new transactionModel({
                    user: req.userId, products: findCart.products, cart: findCart._id, totalPrice: findCart.totalPrice
                })

                findCart.products.map(async (x) => {
                    const findProduct = await mangaModel.findOne({ _id: x.p_id })
                    if (findProduct.stock < x.quantity) {
                        // return res.status(400).send(failure("Checkout failed!Not enough stock"));
                        return sendResponse(res, HTTP_STATUS.CONFLICT, "Checkout failed!Not enough stock")
                    }
                    await checkout.save();
                    findCart.products = [];
                    findCart.totalPrice = 0;
                    await findCart.save();
                    findProduct.stock -= x.quantity;
                    await findProduct.save();
                    const order = new orderModel({
                        user: req.userId, products: checkout.products, cart: findCart._id, totalPrice: checkout.totalPrice
                    })
                    await order.save();
                    findUser.order.push(order._id);
                    await findUser.save();
                    // return res.status(200).send(success("Successfully checked out", checkout));
                    return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", checkout)
                })
            }
            if (findCart.products.length == 0) {
                // return res.status(400).send(failure("Your cart is empty!Please add some products!"));
                return sendResponse(res, HTTP_STATUS.CONFLICT, "Your cart is empty!Please add some products!")
            }
            findCart.products.map(async (x) => {
                const findProduct = await mangaModel.findOne({ _id: x.p_id })
                if (findProduct.stock < x.quantity) {
                    // return res.status(400).send(failure("Checkout failed!Not enough stock"));
                    return sendResponse(res, HTTP_STATUS.CONFLICT, "Checkout failed!Not enough stock")
                }
                const updatedCart = await transactionModel.findOneAndUpdate(
                    { "user": req.userId },
                    { $set: { products: findCart.products, totalPrice: findCart.totalPrice } },
                    { new: true }
                );
                const order = new orderModel({
                    user: req.userId, products: updatedCart.products, cart: findCart._id, totalPrice: updatedCart.totalPrice
                })
                await order.save();
                findUser.order.push(order._id);
                await findUser.save()
                findCart.products = [];
                findCart.totalPrice = 0;
                await findCart.save();
                findProduct.stock -= x.quantity;
                await findProduct.save();
                // return res.status(200).send(success("Successfully checked out", updatedCart));
                return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out", updatedCart)
            })

        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }


}
module.exports = new cart();