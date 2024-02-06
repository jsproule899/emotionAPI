const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');

router.route('/')
    .get(moodController.getMoodsByUser)
    .post(moodController.createMood);
    
router.route('/:id')
    .put(moodController.updateMood)
    .delete(moodController.deleteMood);

module.exports = router;