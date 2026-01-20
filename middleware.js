const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");
const { userSchema, checkerSchema} = require("./schema.js");

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateChecker = (req, res, next) => {
  const { error } = checkerSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash(
            "error",
            "Your session has expired. Please log in again."
        );
        return res.redirect("/auth");
    }
    next();
};

module.exports.isCheckerApproved = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please log in first.");
        return res.redirect("/checker/login");
    }

    if (
        req.user.authorizationStatus !== "approved" ||
        !req.user.isActive
    ) {
        req.flash(
            "error",
            "Your account is still under verification."
        );
        return res.redirect("/checker/login");
    }

    next();
};