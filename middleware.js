const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");

const ADMIN_EMAIL = "admin@gmail.com";

const isAdmin = (user) => {
    return user && user.email && user.email.toLowerCase() === ADMIN_EMAIL;
};

module.exports.isAdmin = isAdmin;

module.exports.isLoggedIn = (req, res, next) => {
   // console.log(req.path,".." ,req.originalUrl); // Debugging log to check the request path and original URL
    if (!req.isAuthenticated()) {
       // req.session.returnTo = req.originalUrl;
       req.session.redirectTo = req.originalUrl; // Store the original URL in session for redirect after login
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError("Listing not found!", 404);
    }

    const ownsListing = listing.owner && listing.owner.equals(req.user._id);

    if (!ownsListing && !isAdmin(req.user)) {
        req.flash("error", "You are not allowed to edit or delete this tour.");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new ExpressError("Review not found!", 404);
    }

    const wroteReview = review.author && review.author.equals(req.user._id);

    if (!wroteReview && !isAdmin(req.user)) {
        req.flash("error", "You are not allowed to edit or delete this review.");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.saveReturnTo = (req, res, next) => {

    if (req.session.redirectTo) {
        res.locals.redirectTo = req.session.redirectTo;
    }
    next();
}
