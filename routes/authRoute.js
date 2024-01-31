const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')

router.route('/login')
    .post(authController.handleLogin);

router.route('/logout')
    .get(authController.handleLogout);

router.route('/signup')
    .post(authController.handleSignup);

router.route('/forgot')
    .post(authController.handleForgotPassword);

router.route('/reset/:token')
    .post(authController.handleResetPassword);

module.exports = router;