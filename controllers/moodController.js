const dbPool = require('../services/dbService');
const Mood = require('../models/Mood.js');



const getMoodsByUser = (req, res) => {

    const { user_id } = req.body;
    const { page } = req.body || 1;
    const { limit } = req.body || 10;
    const { sort } = req.body || 'desc';
    const { search } = req.body || '';
    const offset = limit * (page - 1);

    try {
        switch (sort) {
            case "asc": var moodQuery = `SELECT DISTINCT mood_id,mood_timestamp,user_id,mood.context_id,context_comment,context_timestamp FROM mood LEFT JOIN context ON context.context_id = mood.context_id LEFT JOIN context_context_type ON context.context_id = 
                                         context_context_type.context_id LEFT JOIN context_type ON context_type.context_type_id = context_context_type.context_type_id WHERE user_id = ? AND (context_comment LIKE CONCAT('%',?,'%') OR context_type_name LIKE CONCAT('%',?,'%')) ORDER BY mood_timestamp ASC LIMIT ? OFFSET ? `
                break;
            case "desc": var moodQuery = `SELECT DISTINCT mood_id,mood_timestamp,user_id,mood.context_id,context_comment,context_timestamp FROM mood LEFT JOIN context ON context.context_id = mood.context_id LEFT JOIN context_context_type ON context.context_id = 
                                          context_context_type.context_id LEFT JOIN context_type ON context_type.context_type_id = context_context_type.context_type_id WHERE user_id = ? AND (context_comment LIKE CONCAT('%',?,'%')  OR context_type_name LIKE CONCAT('%',?,'%')) ORDER BY mood_timestamp DESC LIMIT ? OFFSET ? `
                break;
            default: var moodQuery = `SELECT DISTINCT mood_id,mood_timestamp,user_id,mood.context_id,context_comment,context_timestamp FROM mood LEFT JOIN context ON context.context_id = mood.context_id LEFT JOIN context_context_type ON context.context_id = context_context_type.context_id
                                      LEFT JOIN context_type ON context_type.context_type_id = context_context_type.context_type_id WHERE user_id = ? AND (context_comment LIKE CONCAT('%',?,'%') OR context_type_name LIKE CONCAT('%',?,'%')) ORDER BY mood_timestamp DESC LIMIT ? OFFSET ? `

        }

        var emotionQuery = `SELECT emotion_name, emotion_level, emotion_colour, emotion_icon FROM mood JOIN mood_emotion ON mood.mood_id = mood_emotion.mood_id 
                                JOIN emotion ON emotion.emotion_id = mood_emotion.emotion_id 
                                 WHERE mood.mood_id = ?`

        var contextQuery = `SELECT context_type_name, context_icon FROM mood JOIN context ON context.context_id = mood.context_id 
                                JOIN context_context_type ON context.context_id = context_context_type.context_id
                                JOIN context_type ON context_type.context_type_id = context_context_type.context_type_id 
                                WHERE mood.context_id = ? `


        dbPool.getConnection((err, connection) => {
            if (err) throw err;
            connection.beginTransaction((err) => {
                if (err) { connection.release(); throw err }
                connection.query(moodQuery, [user_id, search, search, +limit, +offset], async (err, moods) => {
                    if (err) { connection.release(); throw err };
                    if (!moods) { connection.release(); throw new Error(err.message); }
                    if (moods.length > 0) {
                        let promises = moods.map(async (mood) => {
                            mood.emotion = await new Promise((resolve, reject) => {
                                connection.query(emotionQuery, [mood.mood_id], (err, emotions) => {
                                    if (err) { connection.release(); reject(err) };
                                    resolve(emotions);
                                })
                            });
                            mood.context = await new Promise((resolve, reject) => {
                                connection.query(contextQuery, [mood.context_id], (err, context) => {
                                    if (err) { connection.release(); reject(err) };
                                    resolve(context);
                                })
                            });
                            return mood;
                        });
                        Promise.all(promises).then(
                            moods => {
                                connection.commit(() => {
                                    res.status(200);
                                    res.json({
                                        status: 'success',
                                        message: `${moods.length} records retrieved`,
                                        result: moods
                                    })
                                    connection.release();
                                })
                            }
                        ).catch((err) => {
                            res.status(500);
                            res.json({
                                status: 'failure',
                                message: err.message
                            })
                            connection.release();
                        })
                    } else {
                        res.status(404);
                        res.json({
                            status: 'failure',
                            message: `No Moods found`
                        })
                    }
                });
            });
        });

    } catch (error) {
        res.status(404);
        res.json({
            status: 'failure',
            message: `Invalid user ID: ${user_id}`
        })
    }

}

const createMood = (req, res) => {
    const { user_id } = req.body
    const { enjoyment, sadness, anger, contempt, disgust, fear, surprise, Romance, Family, Work, Holiday, Lonely, Exercise, Friends, Shopping, comment, timestamp } = req.body;
    const newMood = new Mood(user_id, timestamp, comment, enjoyment, sadness, anger, contempt, disgust, fear, surprise, Romance, Family, Work, Holiday, Lonely, Exercise, Friends, Shopping);

    try {
        const query1 = `INSERT INTO context (context_id, context_comment, context_timestamp) VALUES (null, ?, current_timestamp());`
        const query2 = `SET @last_context_id = LAST_INSERT_ID();`
        const query3 = `INSERT INTO context_context_type (context_context_type_id,context_id, context_type_id) VALUES (null, @last_context_id,?);`
        const query4 = `INSERT INTO mood (mood_id, mood_timestamp, user_id, context_id) VALUES (null, ?, ?, @last_context_id );`
        const query5 = `SET @last_mood_id = LAST_INSERT_ID();`
        const query6 = `INSERT INTO mood_emotion (mood_emotion_id, emotion_level, mood_id, emotion_id) VALUES (null, ?, @last_mood_id, ?);`

        dbPool.getConnection((err, connection) => {
            if (err) throw err;
            connection.beginTransaction((err) => {
                if (err) { connection.release(); throw err };
                connection.query(query1, [newMood.context_comment], (err, result) => {
                    if (err) return connection.rollback(() => { connection.release(); throw err })
                    connection.query(query2, (err, result) => {
                        if (err) return connection.rollback(() => { connection.release(); throw err })

                        for (let context in newMood.context) {
                            if (newMood.context[context]) {
                                var contextType;

                                switch (context.toString()) {
                                    case "romance": contextType = 1; break;
                                    case "family": contextType = 2; break;
                                    case "work": contextType = 3; break;
                                    case "holiday": contextType = 4; break;
                                    case "lonely": contextType = 5; break;
                                    case "exercise": contextType = 6; break;
                                    case "friends": contextType = 7; break;
                                    case "shopping": contextType = 8; break;
                                }
                                connection.query(query3, [contextType], (err, result) => {
                                    if (err) return connection.rollback(() => { connection.release(); throw err })
                                });
                            }
                        }
                        connection.query(query4, [newMood.timestamp, newMood.user_id], (err, result) => {
                            if (err) return connection.rollback(() => { connection.release(); throw err })
                            const moodInsertID = result.insertId;
                            connection.query(query5, [newMood.user_id], (err, result) => {
                                if (err) return connection.rollback(() => { connection.release(); throw err })
                                connection.query(query6, [newMood.emotion.enjoyment, 1], (err, result) => {
                                    if (err) return connection.rollback(() => { connection.release(); throw err })
                                    connection.query(query6, [newMood.emotion.sadness, 2], (err, result) => {
                                        if (err) return connection.rollback(() => { connection.release(); throw err })
                                        connection.query(query6, [newMood.emotion.anger, 3], (err, result) => {
                                            if (err) return connection.rollback(() => { connection.release(); throw err })
                                            connection.query(query6, [newMood.emotion.contempt, 4], (err, result) => {
                                                if (err) return connection.rollback(() => { connection.release(); throw err })
                                                connection.query(query6, [newMood.emotion.disgust, 5], (err, result) => {
                                                    if (err) return connection.rollback(() => { connection.release(); throw err })
                                                    connection.query(query6, [newMood.emotion.fear, 6], (err, result) => {
                                                        if (err) return connection.rollback(() => { connection.release(); throw err })
                                                        connection.query(query6, [newMood.emotion.surprise, 7], (err, result) => {
                                                            if (err) return connection.rollback(() => { connection.release(); throw err })
                                                            connection.commit((err) => {
                                                                if (err) return connection.rollback(() => { connection.release(); throw err })
                                                                res.status(201);
                                                                res.json({
                                                                    status: 'success',
                                                                    message: `Record ID ${moodInsertID} added`
                                                                })
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    } catch (err) {
        res.staus(500);
        res.json({
            status: 'failure',
            message: err.message
        })
    }

}

const updateMood = (req, res) => {

    const { contextComment } = req.body;
    const { Romance, Family, Work, Holiday, Lonely, Exercise, Friends, Shopping } = req.body;
    const newContext = { Romance, Family, Work, Holiday, Lonely, Exercise, Friends, Shopping };
    const { id } = req.params;


    const query1 = `SELECT @contextId := context_id FROM mood WHERE mood_id = ?;`
    const query2 = `DELETE FROM context_context_type WHERE context_id = @contextId`
    const query3 = `INSERT INTO context_context_type (context_context_type_id, context_id, context_type_id) VALUES (null, @contextId, ? );`
    const query4 = `UPDATE context SET context_comment = ?, context_timestamp = current_timestamp() WHERE context.context_id = @contextId;`

    try {
        dbPool.getConnection((err, connection) => {
            if (err) throw err;
            connection.beginTransaction((err) => {
                if (err) { connection.release(); throw err };
                connection.query(query1, [+id], (err, result) => {
                    if (err) return connection.rollback(() => { connection.release(); throw err })
                    if (result.length == 0) {
                        return connection.rollback(() => {
                            res.status(404);
                            res.json({
                                status: 'failure',
                                message: `Invalid ID ${id}`
                            });
                            connection.release()
                        });
                    }
                    connection.query(query2, [+id], (err, result) => {
                        if (err) return connection.rollback(() => { connection.release(); throw err })
                        for (let context in newContext) {
                            if (newContext[context]) {
                                var contextType;
                                switch (context.toString()) {
                                    case "Romance": contextType = 1; break;
                                    case "Family": contextType = 2; break;
                                    case "Work": contextType = 3; break;
                                    case "Holiday": contextType = 4; break;
                                    case "Lonely": contextType = 5; break;
                                    case "Exercise": contextType = 6; break;
                                    case "Friends": contextType = 7; break;
                                    case "Shopping": contextType = 8; break;
                                }

                                connection.query(query3, [contextType], (err, result) => {
                                    if (err) return connection.rollback(() => { connection.release(); throw err; });
                                });
                            }
                        }
                        connection.query(query4, [contextComment.toString()], (err, result) => {
                            if (err) return connection.rollback(() => { connection.release(); throw err })

                            connection.commit((err) => {
                                if (err) return connection.rollback(() => { connection.release(); throw err });
                                if (result.affectedRows > 0) {
                                    res.status(200);
                                    res.json({
                                        status: 'success',
                                        message: `Record ID ${id} updated`
                                    });
                                } else {
                                    res.status(404);
                                    res.json({
                                        status: 'failure',
                                        message: `Invalid ID ${id}`
                                    });
                                }
                                connection.release();
                            });
                        });
                    });
                });
            });
        });
    } catch (err) {
        res.staus(500);
        res.json({
            status: 'failure',
            message: err.message
        })

    }

}

const deleteMood = (req, res) => {

    const { id } = req.params;
    const query1 = `SET @moodId = ?;`
    const query2 = `SELECT @contextId := context_id FROM mood WHERE mood_id = @moodId;`
    const query3 = `DELETE FROM context_context_type WHERE context_id = @contextId;`
    const query4 = `DELETE FROM mood_emotion WHERE mood_id= @moodId;`
    const query5 = `DELETE FROM mood WHERE mood_id = @moodId;`
    const query6 = `DELETE FROM context WHERE context_id = @contextId;`

    try {
        dbPool.getConnection((err, connection) => {
            if (err) throw err;
            connection.beginTransaction((err) => {
                if (err) { connection.release(); throw err };
                connection.query(query1, [+id], (err, result) => {
                    if (err) return connection.rollback(() => { connection.release(); throw err })
                    connection.query(query2, (err, result) => {
                        if (err) return connection.rollback(() => { connection.release(); throw err })
                        connection.query(query3, (err, result) => {
                            if (err) return connection.rollback(() => { connection.release(); throw err })
                            connection.query(query4, (err, result) => {
                                if (err) return connection.rollback(() => { connection.release(); throw err })
                                connection.query(query5, (err, result) => {
                                    if (err) return connection.rollback(() => { connection.release(); throw err })
                                    connection.query(query6, (err, result) => {
                                        if (err) return connection.rollback(() => { connection.release(); throw err })
                                        connection.commit((err) => {
                                            if (err) return connection.rollback(() => { connection.release(); throw err })

                                            if (result.affectedRows > 0) {
                                                res.status(200);
                                                res.json({
                                                    status: 'success',
                                                    message: `Record ID ${id} deleted`
                                                })
                                            } else {
                                                res.status(404);
                                                res.json({
                                                    status: 'failure',
                                                    message: `Invalid ID ${id}`
                                                })
                                            }
                                            connection.release()
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (err) {
        res.staus(500);
        res.json({
            status: 'failure',
            message: err.message
        })

    }

}

module.exports = {
    getMoodsByUser,
    createMood,
    updateMood,
    deleteMood,
};