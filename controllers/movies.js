const Movie = require('../models/movie');
const ForbiddenError = require('../errors/forbidden-err');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ErrorMessage = require('../utils/err-messages');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;

  Movie.find({ owner })
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => res.status(200).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(ErrorMessage.BAD_REQUEST));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError(ErrorMessage.NOT_FOUND));
      }
      if (JSON.stringify(req.user._id) !== JSON.stringify(movie.owner)) {
        return next(new ForbiddenError(ErrorMessage.FORBIDDEN));
      }
      return Movie.deleteOne(movie).then(() => res
        .status(200)
        .send(ErrorMessage.OK));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(ErrorMessage.BAD_REQUEST));
      }
      return next(err);
    })
    .catch(next);
};
