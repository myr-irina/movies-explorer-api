const express = require('express');

const router = express.Router();
const { createUser, login, signOut } = require('../controllers/users');
const userRouter = require('./users');
const moviesRouter = require('./movies');
const NotFoundError = require('../errors/not-found-err');
const auth = require('../middlewares/auth');
const { validateCreateUser, validateLogin } = require('../middlewares/validations');

router.post('/signup', validateCreateUser, createUser);
router.post('/signin', validateLogin, login);
router.delete('/signout', signOut);

router.use(auth);

router.use('/users', userRouter);
router.use('/movies', moviesRouter);
router.all('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден.'));
});

module.exports = router;
