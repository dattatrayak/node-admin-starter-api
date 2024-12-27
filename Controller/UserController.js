const User = require('../Models/User');
const RefreshToken = require('../Models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../Config/response');
const { Op } = require('sequelize');
const userSchema = require('../ValidationSchemas/userSchema');


exports.addUser = async (req, res) => {
  try {
    

    const { error } = userSchema.validate(req.body, { abortEarly: false }); // Validate all fields
    if (error) {
        const formattedErrors = formatValidationErrors(error.details);
        return errorResponse(res, 'VALIDATION_ERROR', 400,{ errors: formattedErrors });
        //return res.status(400).json();
    }
  const { email, password, userType } = req.body;
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, userType });
    successResponse(res, "User registered successfully", { user }, 201);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(res, 'Email already in use', 400, { error: error.message });
    }
    errorResponse(res, 'Internal server error', 400, { error: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    // Parse query parameters with defaults
    const { page = 1, limit = 10, search = '' } = req.query;

    // Ensure `page` is at least 1
    const currentPage = Math.max(parseInt(page), 1); // Ensures page >= 1
    const currentLimit = parseInt(limit);

    const offset = (currentPage - 1) * currentLimit;

    // Add search conditions
    const where = search
      ? {
        [Op.or]: [
          { email: { [Op.like]: `%${search}%` } },
          { userType: { [Op.like]: `%${search}%` } },
        ],
      }
      : {};

    // Fetch paginated data
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] }, // Exclude the password field
      limit: currentLimit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Send response
    
    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / currentLimit),
      currentPage,
      data: rows,
    });
  } catch (error) {
    return errorResponse(res,'',500,{ error: error.message }); 
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, userType } = req.body;

    // Check if URL already exists for another menu
    const existingEmail = await User.findOne({ where: { email, id: { [Op.ne]: id } } });
    if (existingEmail) {
      return errorResponse(res,'Email already in use',400,{ message: 'Email already in use' }); 
    }

    const User = await User.findByPk(id);
    if (!User) {
      return errorResponse(res,'User not found',404,{ message: 'User not found' }); 
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    User.email = email;
    User.password = hashedPassword;
    User.userType = userType;

    await User.save();
    successResponse(res, "User updated successfully", { menu }, 200); 
  } catch (error) {
    return errorResponse(res,'',400,{ error: error.message }); 
  }
}; 