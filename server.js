require('dotenv').config();
const app = require('./app')

app.listen(process.env.PORT, (err)=>{
    if(err) return console.log(err);
    console.log(`express REST API running at http://localhost:${process.env.PORT}`);
});