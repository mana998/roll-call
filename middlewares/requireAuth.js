require('dotenv').config();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const isTestingEnvironment = process.env.ENV === 'test';

const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  if (isTestingEnvironment) {
    return next()
  }

  const { authorization } = req.headers;

  if (!authorization) {
    console.log('Unauthorized');
    return res.status(401).send({ error: 'You must be logged in.' });
  }

  const token = authorization.replace('Bearer ', '');

  jwt.verify(token, JWT_SECRET, async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: 'You must be logged in.' });
    }

    // decoded claims, sort of
    req.user = payload;
    next();
  });
}

module.exports = requireAuth;
