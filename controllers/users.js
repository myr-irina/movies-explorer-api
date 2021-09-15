const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../utils/secretKey');
const ErrorMessage = require('../utils/err-messages');

const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized-err');

module.exports.getCurrentUser = (req, res, next) => User.findById(req.user._id)
  .then((user) => res.status(200).send(user))
  .catch((err) => {
    if (err.message === 'NotFound') {
      return next(
        new NotFoundError(ErrorMessage.NOT_FOUND),
      );
    }
    return next(err);
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
        return next(
          new BadRequestError(ErrorMessage.BAD_REQUEST),
        );
      }
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(
          new ConflictError(ErrorMessage.CONFLICT),
        );
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
    }))
    .then((user) => res.status(201).send(user.toJSON()))
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError') {
        return next(
          new BadRequestError(ErrorMessage.BAD_REQUEST),
        );
      } if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(
          new ConflictError(ErrorMessage.CONFLICT),
        );
      }
      return next(err);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });
      res
        .cookie('jwt', token, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
        .send({ token });
    })
    .catch((err) => next(new UnauthorizedError(`${err.message}`)));
};

module.exports.signOut = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  })
    .status(200).send(ErrorMessage.OK);
};
