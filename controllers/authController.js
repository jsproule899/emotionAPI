const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const userController = require('./userController.js')
require('dotenv').config();

const handleSignup = (req, res) => {
    const { username, email, password } = req.body;

    userController.getUserByEmail(email).then(result => {
        if (result) return res.render('signup.ejs', { errMessage: 'Email already in use, please Login or choose another email' });
        else {
            try {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) console.log(err);
                    userController.createAccount(username, email, hash)
                        .then(result => {

                            const accessToken = jwt.sign(
                                {
                                    "user_id": result.insertId,
                                    "username": username,
                                    "email": email
                                },
                                process.env.ACCESS_TOKEN_SECRET
                            );

                            res.cookie('accjwt', accessToken, { httpOnly: true });
                            res.redirect('/')
                        })
                        .catch(err => res.status(409).json({ msg: err.message }));

                })
            } catch (error) {
                console.log(error);
            }
        }
    })

}

const handleLogin = (req, res) => {

    const email = req.body.email;
    const password = req.body.password
    if (!email || !password) return res.render('login.ejs', { errMessage: 'Username and password are required' });

    userController.getUserByEmail(email).then(user => {
        const StoredPwd = user.password.toString('binary');
        bcrypt.compare(password, StoredPwd, (err, result) => {

            if (!result) return res.render('login.ejs', { errMessage: 'You have entered an invalid username or password, Please try again...' });

            if (result) {
                const accessToken = jwt.sign(
                    {
                        "user_id": user.user_id,
                        "username": user.username,
                        "email": user.email
                    },
                    process.env.ACCESS_TOKEN_SECRET
                );

                res.cookie('accjwt', accessToken, { httpOnly: true });
                res.redirect('/')
            }
        })
    }).catch(err => {

        if (err.message === 'Account does not exist') {
        res.redirect(`/signup?emailinput=${email}&errMessage=${err.message} please sign up`);  
        }
    });
}

const handleLogout = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.accjwt) return res.redirect('/');    
    const accessToken = cookies.accjwt;
    res.clearCookie( 'accjwt', accessToken, { httpOnly: true }).redirect('/'); 
}

const handleForgotPassword = (req, res) => {
    const { email } = req.body;
    userController.getUserByEmail(email).then(user => {
        const token = crypto.randomBytes(20).toString('hex');
        userController.setTokenByUser(token, user.user_id);
        // Send the reset token to the user's email
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,

            auth: {
                type: 'OAUTH2',
                user: 'mindyourself.onthewifi@gmail.com',
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            },
        });
        const mailOptions = {
            from: 'mindyourself.onthewifi@gmail.com',
            to: email,
            subject: 'MindYourSelf Password Reset',
            text: `Click the following link to reset your password: https://mindyourself.onthewifi.com/password/reset/${token} or \nClick the following link to reset your password: http://localhost:3000/password/reset/${token} if running locally`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).render('forgotPassword', { errMessage: 'Error sending email try again...' });
            } else {
                console.log(`Email sent: ${info.response}`);
                res.status(200).render('forgotPassword', { sucessMessage: 'Email sent check your mail to reset your password!' });
            }
        });

    }).catch(err => {
        if (err.message === 'Account does not exist') {
            res.redirect(`/signup?emailinput=${email}&errMessage=`+err.message);
        }else{
            res.render('forgotPassword', { errMessage: err.message });
        }
    });

}

const handleResetPassword = (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    getUserByToken(token).then(user => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw (err);
            setPasswordByuser(hash, user.user_id)
            setTokenByuser(null, user.user_id)
        })
        res.redirect('/login?successMessage=Password updated successfully');
    }).catch(err => {
        if (err) res.redirect('/password/reset/invalid?errMessage=Invalid or expired token')
    });
}

module.exports = {
    handleSignup,
    handleLogin, 
    handleLogout,
    handleForgotPassword,
    handleResetPassword
}