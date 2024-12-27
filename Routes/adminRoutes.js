const express = require('express');
const { check, validationResult } = require('express-validator');
const { register, login, refreshTokenUser } = require('../Controller/AuthController');
const { authenticateToken, authorizeRoles } = require('../Middleware/authMiddleware');
const { addMenu, listMenus, menuChildParent, updateMenu, getBreadcrumbs, menuChildParentDropdown } = require('../Controller/adminMenuController');
const { listUsers, addUser, updateUser } = require('../Controller/UserController');
const router = express.Router();

const signupValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('userType', 'User type is required').isIn(['superadmin', 'webadmin', 'admin'])
];

const loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];
const menuValidation = [
    check('name', 'Name is required').notEmpty(),
    check('heading', 'Heading is required').notEmpty(),
    check('url', 'URL is required').notEmpty(),
    check('order', 'Order is required').isInt()
];
const breadcrumbValidation = [ 
    check('url', 'URL is required').notEmpty()
];
const tokenValidation = [ 
    check('token', 'token is required').notEmpty()
];
// router.post('/register', signupValidation, (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
//     register(req, res, next);
// });

router.post('/login', loginValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    login(req, res, next);
});
 
router.post('/refresh-token', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), tokenValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    refreshTokenUser(req, res, next);
});

//menu route
router.post('/menu', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), menuValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    addMenu(req, res, next);
});
router.post('/breadcrumb', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), breadcrumbValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    getBreadcrumbs(req, res, next);
});
router.get('/menus', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), listMenus);
router.get('/menu-dropdown', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), menuChildParentDropdown);
router.put('/menu/:id', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), menuValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    updateMenu(req, res, next);
});
router.get('/menulist', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), menuChildParent);

router.get('/dashboard', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), (req, res) => {
    res.send('Admin dashboard');
});


// router.get('/users', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), listUsers);
// router.post('/users', authenticateToken,authorizeRoles('superadmin', 'webadmin', 'admin'), signupValidation,(req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   addUser(req, res, next);
// });
// router.put('/users/:id', authenticateToken, authorizeRoles('superadmin', 'webadmin', 'admin'), signupValidation, (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//   }
//   updateUser(req, res, next);
// });


module.exports = router;