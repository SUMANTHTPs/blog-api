const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToMongoDB = require('./db');
const fileUpload = require('express-fileupload');
require('dotenv').config();

connectToMongoDB();
const corsOrigin = `${process.env.CORS_ORIGIN}`
corsOrigin = 'http://localhost:3000/'
console.log(corsOrigin);
app.use(cors({ credentials: true, origin: corsOrigin }));


// const allowedOrigins = ['http://localhost:3000/', 'https://localhost:3000/'];

// const corsOptions = {
//   credentials: true, // Allow cookies to be sent with the request
//   origin: (origin, callback) => {
//     // Check if the origin is in the allowed origins list, or if it's not provided (for server-to-server communication)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

// app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true
}))


app.use('/auth', require('./routes/auth'))
app.use('/blogs', require('./routes/blog'))

app.get('*', (req, res) => {
  res.status(400).json({
    msg: 'Please enter valid endpoint, Contact sumanthtps@gmail.com for more details'
  })
})
app.listen(4000, () => {
  console.log('Running server');
});

