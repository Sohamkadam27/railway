const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the full error for debugging
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
  });
};
module.exports = errorHandler;