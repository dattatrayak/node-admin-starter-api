const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors());

dotenv.config();
const sequelize = require('./Config/db');
const userRoutes = require('./Routes/userRoutes');
const adminRoutes = require('./Routes/adminRoutes'); 

// Sync database
sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.log('Error: ' + err));

app.get('/',(req,res)=>{
    res.send({message: "welcome to Jai Manuman"});
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    res.status(err.statusCode).json({ message: err.message });
  });

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`you are running this app ${process.env.PORT} `);
});