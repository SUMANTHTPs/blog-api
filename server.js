const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToMongoDB = require('./db');
const fileUpload = require('express-fileupload');
require('dotenv').config();

connectToMongoDB();
const corsOrigin = `${process.env.CORS_ORIGIN}`
app.use(cors({ credentials: true, origin: corsOrigin }));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true
}))
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
}) 


app.use('/auth', require('./routes/auth'))
app.use('/blogs', require('./routes/blog'))

app.get('*', (req, res) => {
  res.status(400).json({
    msg: 'Bad request, Please contact sumanthtps@gmail.com for more details'
  })
})
app.listen(4000, () => {
  console.log('Running server');
});

