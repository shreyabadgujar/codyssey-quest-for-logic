const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/puzzleService");
exports.lobby = asyncHandler(async (req,res) => res.json({ data: await service.lobby(req.user._id) }));
exports.open = asyncHandler(async (req,res) => res.json({ data: await service.open(req.user._id, req.params.id) }));
exports.act = asyncHandler(async (req,res) => res.json({ data: await service.act(req.user._id, req.params.id, req.params.action, req.body) }));
