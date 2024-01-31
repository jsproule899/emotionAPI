const express = require('express');
const router = express.Router();
const contextTypeController = require('../controllers/contextTypeController')

router.route('/').get(contextTypeController.getContextType)

module.exports = router; 