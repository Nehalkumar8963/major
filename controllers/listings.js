const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
    const { search = "", category = "" } = req.query;
    const filters = {};

    if (search.trim()) {
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escapedSearch, "i");

        filters.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { location: searchRegex },
            { country: searchRegex },
            { category: searchRegex }
        ];
    }

    if (category.trim()) {
        const categoryValue = category.trim();
        const categoryPatterns = {
            Beach: "beach|coast|island|ocean|maldives|bali|fiji|cancun|phuket|mykonos",
            Mountain: "mountain|hill|aspen|banff|verbier|tahoe|highlands",
            City: "city|new york|tokyo|dubai|boston|charleston|los angeles|florence|amsterdam",
            Camping: "camp|cabin|forest|woods|lodge",
            Lake: "lake|tahoe|water",
            Arctic: "snow|ski|arctic|winter",
            Desert: "desert|dubai",
            Trending: "beach|mountain|city|villa|cottage|paradise|luxury"
        };
        const categoryRegex = new RegExp(
            categoryPatterns[categoryValue] || categoryValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );

        filters.$and = filters.$and || [];
        filters.$and.push({
            $or: [
                { category: categoryRegex },
                { title: categoryRegex },
                { description: categoryRegex },
                { location: categoryRegex },
                { country: categoryRegex }
            ]
        });
    }

    const allListings = await Listing.find(filters);
    res.render("listings/index.ejs", {
        allListings,
        searchTerm: search.trim(),
        activeCategory: category.trim()
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        throw new ExpressError("Listing not found!", 404);
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    if (!req.file) {
        throw new ExpressError("Please upload an image.", 400);
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
        filename: req.file.filename,
        url: req.file.path
    };
    await newListing.save();

    req.flash("success", "Listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError("Listing not found!", 404);
    }

    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listingUpdates = { ...req.body.listing };
    delete listingUpdates.owner;
    delete listingUpdates.image;

    if (req.file) {
        listingUpdates.image = {
            filename: req.file.filename,
            url: req.file.path
        };
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, listingUpdates, {
        runValidators: true
    });

    if (!updatedListing) {
        throw new ExpressError("Listing not found!", 404);
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        throw new ExpressError("Listing not found!", 404);
    }

    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};
