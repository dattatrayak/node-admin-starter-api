 
const formatValidationErrors = (errors) => {
    return errors.map((error) => ({
        field: error.path, // The field causing the error
        message: error.message, // The error message
    }));
};

module.exports = { formatValidationErrors };
