const express = require('express');
const router  = express.Router();

const authCtrl       = require('../controllers/authController');
const categoryCtrl   = require('../controllers/categoryController');
const enterpriseCtrl = require('../controllers/enterpriseController');
const productCtrl    = require('../controllers/productController');
const cartCtrl       = require('../controllers/cartController');
const orderCtrl      = require('../controllers/orderController');
const adminCtrl      = require('../controllers/adminController');

const { authenticate, requireVerified, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ─── AUTH ─────────────────────────────────────────────────────────────────────
router.post('/auth/register',        authCtrl.register);
router.get ('/auth/verify-email',    authCtrl.verifyEmail);
router.post('/auth/login',           authCtrl.login);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.post('/auth/reset-password',  authCtrl.resetPassword);
router.get ('/auth/me',              authenticate, authCtrl.getMe);
router.put ('/auth/profile',         authenticate, authCtrl.updateProfile);
router.put ('/auth/password',        authenticate, authCtrl.updatePassword);
router.delete('/auth/account',       authenticate, authCtrl.deleteAccount);

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
router.get('/categories', categoryCtrl.getAll);

// ─── PRODUCTS (public) ───────────────────────────────────────────────────────
router.get('/products',     productCtrl.getAll);
router.get('/products/:id', productCtrl.getOne);

// ─── ENTERPRISE (seller) ─────────────────────────────────────────────────────
router.get ('/enterprise', authenticate, requireVerified, authorize('seller'), enterpriseCtrl.getMyEnterprise);
router.post('/enterprise', authenticate, requireVerified, authorize('seller'), enterpriseCtrl.createEnterprise);

// ─── SELLER PRODUCTS ─────────────────────────────────────────────────────────
router.get   ('/seller/products',     authenticate, requireVerified, authorize('seller'), productCtrl.getMyProducts);
router.post  ('/seller/products',     authenticate, requireVerified, authorize('seller'), upload.single('image'), productCtrl.create);
router.put   ('/seller/products/:id', authenticate, requireVerified, authorize('seller'), upload.single('image'), productCtrl.update);
router.delete('/seller/products/:id', authenticate, requireVerified, authorize('seller'), productCtrl.destroy);

// ─── CART (client) ───────────────────────────────────────────────────────────
router.get   ('/cart',                    authenticate, requireVerified, authorize('client'), cartCtrl.getCart);
router.post  ('/cart/add',                authenticate, requireVerified, authorize('client'), cartCtrl.addItem);
router.patch ('/cart/update/:product_id', authenticate, requireVerified, authorize('client'), cartCtrl.updateItem);
router.delete('/cart/remove/:product_id', authenticate, requireVerified, authorize('client'), cartCtrl.removeItem);
router.delete('/cart/clear',              authenticate, requireVerified, authorize('client'), cartCtrl.clearCart);

// ─── ORDERS (client) ─────────────────────────────────────────────────────────
router.post('/orders',     authenticate, requireVerified, authorize('client'), orderCtrl.store);
router.get ('/orders',     authenticate, requireVerified, authorize('client'), orderCtrl.index);
router.get ('/orders/:id', authenticate, requireVerified, authorize('client'), orderCtrl.show);

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.get   ('/admin/stats',     authenticate, requireVerified, authorize('admin'), adminCtrl.getStats);
router.get   ('/admin/users',     authenticate, requireVerified, authorize('admin'), adminCtrl.getUsers);
router.delete('/admin/users/:id', authenticate, requireVerified, authorize('admin'), adminCtrl.deleteUser);

module.exports = router;