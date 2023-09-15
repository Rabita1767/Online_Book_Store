const HTTP_STATUS = require("../constants/statusCode");
const userModel = require("../models/users");
const { sendResponse } = require("../util/common");

class validate {
    async validatePage(req, res, next) {
        const { page, limit } = req.query;
        const error = {};
        if (page <= 0 || (page >= 'A' && page <= 'Z') || (page >= 'a' && page <= 'z')) {
            error.page = "Page number is invalid!";
        }
        if (limit <= 0 || (limit >= 'A' && limit <= 'Z') || (limit >= 'a' && limit <= 'z')) {
            error.limit = "Limit is invalid!";
        }
        const size = Object.keys(error).length;
        if (size > 0) {
            return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Could not fetch data!", error);
        }
        next();

    }
    async validateSignup(req, res, next) {
        try {
            const { role, superAdmin } = req.body;
            if ((!role && superAdmin == true) || (role > 1 && superAdmin == true)) {
                return sendResponse(res, HTTP_STATUS.CONFLICT, "Unauthorized role");
            }
            next();
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    // async findUser(req, res, next) {
    //     try {
    //         const findUser = await userModel.findById({ _id: req.userId });
    //         if (!findUser) {
    //             return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User not found");
    //         }
    //         next();
    //     } catch (error) {
    //         console.log(error);
    //         return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal Server Error!");
    //     }
    // }
}
module.exports = new validate();