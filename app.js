const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const userRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const createUser = require('./routes/users');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.post('/signup', createUser);

app.use(helmet());

app.use('/', userRouter);
app.use('/', moviesRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
