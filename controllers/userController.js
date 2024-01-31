const dbPool = require('../services/dbService');

const getUsers = (req, res) => {
    const query = 'SELECT * FROM user';
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

const getUserByEmail = (req, res) => {
    const { email } = req.body;
    const query = 'SELECT * FROM user WHERE email = ?';
    dbPool.query(query, [email], (err, result) => {
        if (err) {
            res.status(500);
            res.json({
                status: 'failure',
                message: err.message
            })
        } else {
            if (result.length > 0) {
                res.status(200);
                res.json({
                    status: 'success',
                    message: `Record with email:${email} retrieved`,
                    result: result
                })
            } else {
                res.status(404);
                res.json({
                    status: 'failure',
                    message: `Invalid email: ${email}`
                })
            }

        }
    });
};

const createAccount = (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO user (user_id, username, email, password) VALUES (NULL, ?, ?, ?);'
    dbPool.query(query, [username, email, password], (err, result) => {
        if (err) {
            res.staus(500);
            res.json({
                status: 'failure',
                message: err.message
            })
        } else {
            res.status(201);
            res.json({
                status: 'success',
                message: `Record ID ${result.insertId} added`
            })
        }
    });

}

const getUserByToken = (req, res) => {
    const { token } = req.body;
    const query = 'SELECT * FROM user WHERE reset_token = ?';
    dbPool.query(query, [token], (err, result) => {
        if (err) {
            res.status(500);
            res.json({
                status: 'failure',
                message: err.message
            })
        } else {
            if (result.length > 0) {
                res.status(200);
                res.json({
                    status: 'success',
                    message: `Record with reset token:${token} retrieved`,
                    result: result
                })
            } else {
                res.status(404);
                res.json({
                    status: 'failure',
                    message: `Invalid reset token: ${token}`
                })
            }

        }
    });
}

const setTokenByUser = (req, res) => {
    const { id } = req.params;
    const { token } = req.body;
    const query = 'UPDATE user SET reset_token = ? WHERE user_id = ?';
    dbPool.query(query, [token, id], (err, result) => {
        if (err) {
            res.staus(500);
            res.json({
                status: 'failure',
                message: err.message
            })
        } else {
            if (result.affectedRows > 0) {
                res.status(200);
                res.json({
                    status: 'success',
                    message: `Record ID ${id} patched with token: ${token}`
                })
            } else {
                res.status(404);
                res.json({
                    status: 'failure',
                    message: `Invalid ID ${id}`
                })
            }

        }
    });
}

const setPasswordByUser = (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    const query = 'UPDATE user SET password = ? WHERE user_id = ?';
    dbPool.query(query, [password, id], (err, result) => {
        if (err) {
            res.staus(500);
            res.json({
                status: 'failure',
                message: err.message
            })
        } else {
            if (result.affectedRows > 0) {
                res.status(200);
                res.json({
                    status: 'success',
                    message: `Record ID ${id} patched with password: ${password}`
                })
            } else {
                res.status(404);
                res.json({
                    status: 'failure',
                    message: `Invalid ID ${id}`
                })
            }

        }

    });

}

const updateUser = (req, res) => {
    const { id } = req.params;
    const { username, email, password, token } = req.body;
    const query = 'UPDATE user SET username = ?, email = ?, password = ?, reset_token = ? WHERE user_id = ?';
    dbPool.query(query, [username, email, password, token, id], (err, result) => {
        if (err) {
            res.staus(500);
            res.json({
                status: 'failure',
                message: err.message
            })
        } else {
            if (result.affectedRows > 0) {
                res.status(200);
                res.json({
                    status: 'success',
                    message: `Record ID ${id} updated with username: ${username}, email: ${email}, password: ${password} and token: ${token}`
                })
            } else {
                res.status(404);
                res.json({
                    status: 'failure',
                    message: `Invalid ID ${id}`
                })
            }

        }
    });
}

const deleteAccount = (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id || id != user_id) {
        res.status(401);
        res.json({
            status: 'failure',
            message: 'Not authorised to delete this account'
        })
    } else {
        const query = 'DELETE FROM user WHERE user_id = ?';
        dbPool.query(query, [id], (err, result) => {
            if (err) {
                res.staus(500);
                res.json({
                    status: 'failure',
                    message: err.message
                })
            } else {
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

            }
        });
    }



}

module.exports = {
    getUsers,
    getUserByEmail,
    createAccount,
    getUserByToken,
    setTokenByUser,
    setPasswordByUser,
    updateUser,
    deleteAccount

}