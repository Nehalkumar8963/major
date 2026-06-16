const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

const normalizeCart = (req) => {
  req.session.cart = Array.isArray(req.session.cart) ? req.session.cart : [];
  return req.session.cart;
};

module.exports.renderCart = async (req, res) => {
  const cart = normalizeCart(req);
  const listings = await Listing.find({ _id: { $in: cart } }).populate("owner");
  const listingsById = new Map(listings.map((listing) => [String(listing._id), listing]));
  const items = cart
    .map((id) => listingsById.get(String(id)))
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const serviceFee = items.length ? Math.round(subtotal * 0.12) : 0;
  const total = subtotal + serviceFee;

  res.render("cart/index.ejs", { items, subtotal, serviceFee, total });
};

module.exports.addToCart = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ExpressError("Listing not found!", 404);
  }

  const cart = normalizeCart(req);
  if (!cart.includes(id)) {
    cart.push(id);
    req.session.cart = cart;
  }

  req.flash("success", `${listing.title} added to cart.`);
  res.redirect(`/listings/${id}`);
};

module.exports.removeFromCart = async (req, res) => {
  const { id } = req.params;
  const cart = normalizeCart(req);
  req.session.cart = cart.filter((itemId) => itemId !== id);
  req.flash("success", "Item removed from cart.");
  res.redirect("/cart");
};

module.exports.clearCart = (req, res) => {
  req.session.cart = [];
  req.flash("success", "Cart cleared.");
  res.redirect("/cart");
};
