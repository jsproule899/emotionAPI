const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

//Http logger
app.use(morgan('tiny'));

//built-in middleware for json
app.use(express.json());

//built-in middleware to handle urelencoded form data
app.use(express.urlencoded({ extended: true }));

//built-in middleware for cookies
app.use(cookieParser());

//routes
app.use('/users', require('./routes/userRoute'))
app.use('/moods', require('./routes/moodRoute'));
app.use('/emotions', require('./routes/emotionRoute'));
app.use('/context-type', require('./routes/contextTypeRoute'));
app.use('/page-count', require('./routes/pageCountRoute'))

module.exports = app;