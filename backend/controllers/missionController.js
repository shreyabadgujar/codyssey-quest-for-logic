const notImplemented = require("../utils/notImplemented");
const asyncHandler=require("../utils/asyncHandler");
const service=require("../services/missionService");
exports.getOne = asyncHandler(async(req,res)=>res.json({data:await service.getMission(req.user._id,req.params.id)}));
exports.editorial = asyncHandler(async(req,res)=>res.json({data:await service.getEditorial(req.user._id,req.params.id)}));
exports.findObject = notImplemented("Find object");
