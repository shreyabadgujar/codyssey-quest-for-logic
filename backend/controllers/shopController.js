const asyncHandler = require("../utils/asyncHandler");
const shopService = require("../services/shopService");

exports.listItems = asyncHandler(async (req, res) => {
  res.json({ data: await shopService.listItems(req.user) });
});

exports.purchase = asyncHandler(async (req, res) => {
  res.json({ data: await shopService.purchase(req.user._id, req.body) });
});
