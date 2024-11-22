const USE_CACHE = true;

function mwCacheFlagger(req, res, next) {
  req.useCache = USE_CACHE;
  next();
}

module.exports = mwCacheFlagger;
