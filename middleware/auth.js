const express = require("express");
//const { success, failure } = require("../write/message")
const HTTP_STATUS = require("../constants/statusCode");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../util/common");
const SECRET_KEY = "myapi";
class authentication {
    auth(req, res, next) {
        try {
            let token = req.headers.authorization;
            console.log(`token ${token}`)
            if (token) {
                token = token.split(" ")[1];
                let user = jwt.verify(token, SECRET_KEY);
                req.userId = user.id;
                console.log(`hello ${req.userId}`);
                if (user) {
                    next()
                }
                else {
                    throw new Error();
                }
            }
            else {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
            }
        } catch (error) {
            console.log(error);
            if (error instanceof jwt.JsonWebTokenError) {
                //return res.status(500).send(failure("Token Invalid"))
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Token Invalid");
            }
            if (error instanceof jwt.TokenExpiredError) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Please Log in again!");
            }
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }

    isRole(req, res, next) {
        try {
            let token = req.headers.authorization;

            if (token) {
                token = token.split(" ")[1];
                const decodedToken = jwt.decode(token, SECRET_KEY);
                if (decodedToken) {

                    req.userRole = decodedToken.role;

                    console.log(`now ${req.userRole}`)
                    if (req.userRole == 1) {
                        next();
                    }
                    else {
                        //res.status(400).send("Unauthorized access to this route");
                        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized Access");
                    }

                } else {
                    //res.status(400).send("Invalid token!");
                    return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
                }
            } else {
                //res.status(400).send("Unauthorized users!");
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized Users");
            }
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    isUser(req, res, next) {
        try {
            let token = req.headers.authorization;
            if (token) {
                token = token.split(" ")[1];
                const decodedToken = jwt.decode(token, SECRET_KEY);
                if (decodedToken) {

                    req.userRole = decodedToken.role;

                    console.log(`now ${req.userRole}`)
                    if (req.userRole > 1) {
                        next();
                    }
                    else {
                        //res.status(400).send("Unauthorized access to this route");
                        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized Access");
                    }

                } else {
                    //res.status(400).send("Invalid token!");
                    return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
                }
            } else {
                //res.status(400).send("Unauthorized users!");
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized Users");
            }
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    isSuper(req, res, next) {
        try {
            let token = req.headers.authorization;
            if (token) {
                token = token.split(" ")[1];
                const decodedToken = jwt.decode(token, SECRET_KEY);
                if (decodedToken) {

                    req.userRole = decodedToken.superAdmin;
                    console.log(`now ${req.userRole}`)
                    if (req.userRole == 1) {
                        next();
                    }
                    else {
                        //res.status(400).send("Unauthorized access to this route");
                        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized Access");
                    }

                } else {
                    //res.status(400).send("Invalid token!");
                    return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
                }
            } else {
                //res.status(400).send("Unauthorized users!");
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized Users");
            }
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    // cartAuth(req, res, next) {
    //     try {
    //         let token = req.headers.authorization;
    //         if (token) {
    //             token = token.split(" ")[1];
    //             let user = jwt.verify(token, SECRET_KEY);
    //             req.userId = user.id;
    //             console.log(`hello ${req.userId}`);
    //             if (user) {
    //                 next()
    //             }
    //             else {
    //                 throw new Error();
    //             }
    //         }
    //         else {
    //             next();
    //         }
    //     } catch (error) {
    //         next();
    //         // console.log(error);
    //         // if (error instanceof jwt.JsonWebTokenError) {
    //         //     //return res.status(500).send(failure("Token Invalid"))
    //         //     return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Token Invalid");
    //         // }
    //         // if (error instanceof jwt.TokenExpiredError) {
    //         //     return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Please Log in again!");
    //         // }
    //         // return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
    //     }
    // }
    validateJSON(req, res, next) {
        try {
            JSON.parse(JSON.stringify(req.body));
            next(); // JSON is valid, proceed to the next middleware
        } catch (error) {
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
}

module.exports = new authentication();
