import { ApiResponse } from "./ApiResponse.js";

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => {
                // Use ApiResponse for error
                console.log(err);
                const statusCode = err.statusCode || 500;
                const response = new ApiResponse(statusCode, null, err.message);
                res.status(statusCode).json(response);
            });
    };
};

export { asyncHandler };
