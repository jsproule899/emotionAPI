const dbPool = require('../services/dbService');

const getEmotions = (req, res) => {
    const query = `SELECT * FROM emotion;`;
    dbPool.query(query, (err, result) => {
        if (err) {
            res.status(500);
            res.json({
                status: 'failure',
                message: err.message
            })
        } else {
            res.status(200);
            res.json({
                status: 'success',
                message: `${result.length} records retrieved`,
                result: result
            })
        }
    });
}

module.exports = { 
    getEmotions
}
