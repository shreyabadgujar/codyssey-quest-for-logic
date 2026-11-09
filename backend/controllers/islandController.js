const asyncHandler=require("../utils/asyncHandler");
const service=require("../services/missionService");
exports.list=asyncHandler(async(req,res)=>res.json({data:await service.listIslands(req.user._id)}));
exports.getOne=asyncHandler(async(req,res)=>res.json({data:await service.getIsland(req.user._id,req.params.id)}));
