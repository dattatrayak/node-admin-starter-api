const successResponse = (res, message, data = {}, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const errorResponse = (res, message='', statusCode = 500, errors = []) => {
    res.status(statusCode).json({
        success: false,
        message: (message) ? message : 'Some thing went wrong!',
        errors,
    });
};

module.exports = { successResponse, errorResponse };