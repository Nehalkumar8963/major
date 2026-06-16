const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const cartController = require("../controllers/cart.js");

router.post("/clear", cartController.clearCart);
router.get("/", wrapAsync(cartController.renderCart));
router.post("/:id/remove", wrapAsync(cartController.removeFromCart));
router.post("/:id", wrapAsync(cartController.addToCart));

module.exports = router;
