require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const { MONGO_URL } = require('./utils/secretKey');
const errorHandler = require('./middlewares/errorHandler');
const { limiter } = require('./middlewares/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const app = express();
const router = require('./routes/index');

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(
  cors({
    origin: [
      'https://films-express.nomoredomains.club',
      'http://films-express.nomoredomains.club',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  }),
);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
app.use(cookieParser());
app.use(helmet());
app.use(limiter);
app.use(router);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
