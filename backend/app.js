const express = require('express');
const userRoutes = require('./routes/userRoutes')
const groupRoutes = require('./routes/groupRoutes')
const app = express();
const cors = require('cors'); 
const sequelize = require('./util/database');
app.use(cors({
    origin:"*"
}))
app.use(express.json());
app.use('/users', userRoutes)
app.use('/group',groupRoutes)
sequelize.sync()
.then(()=>{
    app.listen(process.env.PORT_NO);
})
.catch((err)=>{
    console.log(err);
})