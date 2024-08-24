// const app = require ("./app");

// const { connectDatabase } = require("./config/database");

// connectDatabase();

// app.listen(process.env.PORT,()=>{
    
//     console.log(`server is running on port ${process.env.PORT}`);

// });
// const app = require('./app');
// const mongoose = require('mongoose');

// const PORT = process.env.PORT || 4000;
// const DB_URI = process.env.DB_URI;

// // Connect to the database
// mongoose.connect(DB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => {
//     console.log('Database connected successfully');
// }).catch((err) => {
//     console.error('Database connection error: ', err);
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 4000;
const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI,{connectTimeoutMS: 30000})
 
.then(() => {
    console.log('Database connected successfully');
}).catch((err) => {
    console.error('Database connection error: ', err);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
