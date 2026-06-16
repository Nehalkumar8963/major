const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { listingSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressError.js');
const { isLoggedIn, isOwner } = require('../middleware.js');
const listingsController = require('../controllers/listings.js');
const upload = require('../utils/upload.js');

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    console.log("Validation Error in PUT route:", req.body, error); // Debugging log
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }
  next();
};

router.get("/", wrapAsync(listingsController.index));

router.get("/new", isLoggedIn, listingsController.renderNewForm);

router.get("/:id", wrapAsync(listingsController.showListing));

router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingsController.createListing)
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.renderEditForm)
);

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingsController.updateListing)
);

router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.destroyListing)
);

module.exports = router;
