const express = require('express');
const router = express.Router();
const pageCountController = require('../controllers/pageCountController')

router.route('/').get(pageCountController.getPageCount)

module.exports = router; 