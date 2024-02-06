const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


//GET
router.route('/').get(userController.getUsers);
router.route('/email').get(userController.getUserByEmail);
router.route('/token').get(userController.getUserByToken);

//POST
router.route('/').post(userController.createAccount);

//PUT
router.route('/:id').put(userController.updateUser);

//PATCH
router.route('/:id/password').patch(userController.setPasswordByUser);
router.route('/:id/token').patch(userController.setTokenByUser);

//DELETE
router.route('/:id').delete(userController.deleteAccount);

module.exports = router;