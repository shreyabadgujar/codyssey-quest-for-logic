const asyncHandler = require("../utils/asyncHandler");
const { submit } = require("../services/submissionService");
exports.create = asyncHandler(async (req, res) => res.json({ data: await submit(req.user._id, req.body) }));
exports.run = asyncHandler(async (req, res) => res.json({ data: await submit(req.user._id, req.body, true) }));
