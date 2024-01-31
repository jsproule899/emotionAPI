const dbPool = require('../services/dbService');

const getContextType = (req, res) => {
    const query = `SELECT * FROM context_type;`;
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
    getContextType
}