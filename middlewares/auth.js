const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/secretKey');
const ErrorMessage = require('../utils/err-messages');
const UnauthorizedError = require('../errors/unauthorized-err');

const auth = (req, res, next) => {
  if (!req.cookies.jwt) {
    next(new UnauthorizedError(ErrorMessage.UNAUTHORIZED));
  } else {
    const token = req.cookies.jwt;
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      next(new UnauthorizedError(ErrorMessage.UNAUTHORIZED));
    }

    req.user = payload;

    next();
  }
};

module.exports = auth;
