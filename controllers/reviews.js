const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new ExpressError("Listing not found!", 404);
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();

    req.flash("success", "Review created successfully!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new ExpressError("Review not found!", 404);
    }

    res.render("reviews/edit.ejs", { listingId: id, review });
};

module.exports.updateReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        req.body.review,
        { runValidators: true }
    );

    if (!updatedReview) {
        throw new ExpressError("Review not found!", 404);
    }

    req.flash("success", "Review updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
        throw new ExpressError("Review not found!", 404);
    }

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
};
