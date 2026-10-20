/* 404 — thrown when no route matches */
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

/* Central error handler — every next(err) lands here */
const errorHandler = (err, req, res, _next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  console.error(`[${status}] ${err.message}`);

  res.status(status).json({
    message: err.message,
    // Hide stack trace in production
    ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };