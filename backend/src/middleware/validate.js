const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.param || err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: 'Validation failed',
      errors: errorMessages,
    });
  }

  next();
};

module.exports = validate;
