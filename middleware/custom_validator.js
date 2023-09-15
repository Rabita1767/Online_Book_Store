const HTTP_STATUS = require("../constants/statusCode");
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
}
module.exports = new validate();