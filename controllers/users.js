const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedUsername = username?.trim();

        if (!normalizedEmail || !normalizedUsername || !password) {
            req.flash("error", "All signup fields are required.");
            return res.redirect("/signup");
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            req.flash("error", "An account with this email already exists.");
            return res.redirect("/signup");
        }

        const newUser = new User({ email: normalizedEmail, username: normalizedUsername });
        await newUser.setPassword(password);

        // passport-local-mongoose 8 + Mongoose 9 can fail on save hooks during register,
        // so we insert the fully prepared document directly.
        await User.collection.insertOne(newUser.toObject());
        const registeredUser = await User.findById(newUser._id);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash("success", "Welcome to Wanderlust!");
            return res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");

    const redirectUrl = res.locals.redirectTo || "/listings";
    delete req.session.redirectTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};
