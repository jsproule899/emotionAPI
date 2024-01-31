const express = require('express');
const app = express();
require('dotenv').config();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoute')
const moodRouter = require('./routes/moodRoute');
const userRouter = require('./routes/userRoute')
const emotionRouter = require('./routes/emotionRoute');
const contextTypeRouter = require('./routes/contextTypeRoute')
const pageCountRouter = require('./routes/pageCountRoute')


//built-in middleware for json
app.use(express.json());

//Http logger
app.use(morgan('tiny'));

//built-in middleware to handle urelencoded form data
app.use(express.urlencoded({ extended: true }));

//built-in middleware for cookies
app.use(cookieParser());

//routes
app.use('/auth', authRouter);
app.use('/users', userRouter)
app.use('/moods', moodRouter);
app.use('/emotions', emotionRouter);
app.use('/context-type', contextTypeRouter);
app.use('/page-count', pageCountRouter)

app.listen(process.env.PORT, (err)=>{
    if(err) return console.log(err);
    console.log(`express REST API running at http://localhost:${process.env.PORT}`);
});