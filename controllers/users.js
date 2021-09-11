const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');
const NotFoundError = require('../errors/not-found-err');

const User = require('../models/user');

module.exports.getCurrentUser = (req, res, next) => User.findById(req.user._id)
  .then((user) => res.status(200).send(user))
  .catch((err) => {
    if (err.name === 'CastError') {
      return next(new BadRequestError('Ошибка при запросе.'));
    } if (err.message === 'NotFound') {
      return next(new NotFoundError('Пользователь по указанному _id не найден.'));
    } return next(err);
  });

module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении данных пользователя.'));
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует.'));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Email или пароль не могут быть пустыми'));
  }

  return User.create({
    email,
    password,
    name,
  })
    .then((user) => res.status(201).send(user.toJSON()))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      } if (err.name === 'MongoError' && err.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует.'));
      }
      return next(err);
    });
};
