const express = require('express');
const router = express.Router();
const emotionController = require('../controllers/emotionController')

router.route('/').get(emotionController.getEmotions)

module.exports = router; 