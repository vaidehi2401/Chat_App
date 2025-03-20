const express = require('express');
const userRoutes = require('./routes/userRoutes')
const app = express();
const cors = require('cors'); 
const sequelize = require('./util/database');
app.use(cors({
    origin:"*"
}))
app.use(express.json());
app.use('/users', userRoutes)
sequelize.sync()
.then(()=>{
    app.listen(process.env.PORT_NO);
})
.catch((err)=>{
    console.log(err);
})