const dbPool = require('../services/dbService');


const getPageCount = (req,res) => {

    const { user_id, limit, search } = req.body;
    const query = `SELECT count(DISTINCT mood_id) AS TotalCount from mood LEFT JOIN context ON context.context_id = mood.context_id LEFT JOIN context_context_type ON context.context_id = 
                       context_context_type.context_id LEFT JOIN context_type ON context_type.context_type_id = context_context_type.context_type_id WHERE user_id = ? AND (context_comment LIKE CONCAT('%',?,'%')  OR context_type_name LIKE CONCAT('%',?,'%'))`;

    
        dbPool.query(query, [user_id, search, search], (err, result) => {
            if (err) {
                res.status(500);
                res.json({
                    status: 'failure',
                    message: err.message
                })
            } else {
                const totalMoods = result[0].TotalCount;
                const totalPages = Math.ceil(totalMoods / limit);

                res.status(200);
                res.json({
                    status: 'success',
                    message: `${result.length} records retrieved`,
                    rows:result,
                    result: totalPages
                })
            }
        });
            

     
 


}
module.exports = { 
    getPageCount
}
