const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');

//GET
router.route('/')
    .get(moodController.getMoodsByUser);
    
//POST
router.route('/')
    .post(moodController.createMood);

//PUT
router.route('/:id')
    .put(moodController.updateMood);

//DELETE 
router.route('/:id')
    .delete(moodController.deleteMood);

module.exports = router;