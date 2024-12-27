const Joi = require('joi');

const userSchema = Joi.object({ 
    email:  Joi.string().email().required(),
    password: Joi
    .string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .min(8)
    .max(12).messages({
        'string.pattern.base': 'Password must have at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.',
        'any.required': 'Password is required.',
      }),
    confirmPassword: Joi.ref("password"),
    userType: Joi.string().valid('superadmin', 'webadmin', 'admin').required(),
});
module.exports = userSchema;