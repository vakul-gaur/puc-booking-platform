const Joi = require("joi");

module.exports.userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),

  contact: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

  password: Joi.string().min(3).required(),
});