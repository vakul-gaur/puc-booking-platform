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

module.exports.checkerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),

  contact: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

  licenseNumber: Joi.string().min(5).max(30).required(),

  licenseExpiry: Joi.date().greater("now").required(),

  documents: Joi.object({
    idProofType: Joi.string()
      .valid("AADHAAR", "DL", "PASSPORT")
      .required(),

    documentFiles: Joi.array()
      .items(Joi.string())
      .min(1)
      .required(),
  }).required(),
});
