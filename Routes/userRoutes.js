const express = require('express');
const {  validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../Middleware/authMiddleware');
const { listUsers, addUser, updateUser } = require('../Controller/UserController');
const userSchema = require('../ValidationSchemas/userSchema');
const { formatValidationErrors } = require('../Helper/validation');
const { errorResponse } = require('../Config/response');
const router = express.Router();
 
router.get('/', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), listUsers);


router.post('/', authenticateToken,authorizeRoles('superadmin', 'webadmin', 'admin'), (req, res, next) => {
    const { error } = userSchema.validate(req.body, { abortEarly: false }); // Validate all fields
    if (error) {
        const formattedErrors = formatValidationErrors(error.details);
        return errorResponse(res, 'VALIDATION_ERROR', 422,{ errors: formattedErrors }); 
    }

  addUser(req, res, next);
});
router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  updateUser(req, res, next);
});


module.exports = router;