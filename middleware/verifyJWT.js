const jwt = require('jsonwebtoken');
require('dotenv').config

const verifyJWT = (req, res, next) => {
    
    const authCookie = req.cookies.accjwt;
    if(!authCookie) return next()
    
    jwt.verify(
        authCookie,
        process.env.ACCESS_TOKEN_SECRET, 
        (err, decoded) => {
            
            if(err) res.redirect('/').status(403);
            
            const user = decoded
                       
            req.user = user;
           
        }
    ); 
    
    next();
}

module.exports =  verifyJWT  ;