const mongoose = require("mongoose");
const Mission = require("../models/Mission");
const Island = require("../models/Island");
const Progress = require("../models/Progress");
const { assertUnlocked } = require("./progressService");
const missing = () => Object.assign(new Error("Mission not found"), {status:404,code:"NOT_FOUND"});
async function resolveMission(id) {
  if (mongoose.isObjectIdOrHexString(id)) return Mission.findById(id);
  // Older map links used island-level identifiers. Resolve those without duplicating mission records.
  const match=/^array-archipelago-(\d+)$/.exec(id);
  if(match){const island=await Island.findOne({slug:"array-archipelago"});return island?Mission.findOne({island:island._id,level:Number(match[1])}):null;}
  if(/^array-\d{2}$/.test(id))return Mission.findOne({slug:id});
  return null;
}
async function getMission(user,id) {
  const mission=await resolveMission(id);
  if(!mission)throw missing();
  await assertUnlocked(user,mission);
  const island=await Island.findById(mission.island).lean();
  const completed=Boolean(await Progress.exists({user,mission:mission._id,status:"completed"}));
  const next=await Mission.findOne({island:mission.island,level:mission.level+1}).select("_id").lean();
  // Explicit public DTO: future private fields cannot leak through document spreading.
  return {id:String(mission._id),slug:mission.slug,level:mission.level,title:mission.title,
    islandId:island.slug,islandName:island.name,totalLevels:island.totalLevels,difficulty:mission.difficulty,stage:mission.stage,
    introduction:mission.introduction,description:mission.description,inputFormat:mission.inputFormat,
    outputFormat:mission.outputFormat,constraints:mission.constraints,hints:mission.hints,
    sampleTestCases:mission.sampleTestCases,starterCode:mission.starterCode,
    xpReward:mission.xpReward,coinReward:mission.coinReward,completed,nextMissionId:next?String(next._id):null};
}
async function getEditorial(user,id) {
  const mission=await resolveMission(id);
  if(!mission)throw missing();
  await assertUnlocked(user,mission);
  const document=await Mission.findById(mission._id).select("+editorial").lean();
  return document.editorial;
}
async function getIsland(user,slug) {
  const island=await Island.findOne({slug}).lean();
  if(!island)throw Object.assign(new Error("This island's case files have not been published yet"),{status:404,code:"ISLAND_NOT_PUBLISHED"});
  const missions=await Mission.find({island:island._id}).sort({level:1}).select("_id level title difficulty xpReward coinReward introduction").lean();
  const records=await Progress.find({user,island:island._id,status:"completed"}).select("mission completedAt").lean();
  const lastCompletedAt=records.reduce((latest, record) =>
    record.completedAt && (!latest || record.completedAt > latest) ? record.completedAt : latest, null);
  const done=new Set(records.map(p=>String(p.mission)));
  const levels=missions.map((m,i)=>({id:String(m._id),level:m.level,title:m.title,difficulty:m.difficulty,
    xp:m.xpReward,coins:m.coinReward,status:done.has(String(m._id))?"completed":m.level===1||(i>0&&missions[i-1].level===m.level-1&&done.has(String(missions[i-1]._id)))?"unlocked":"locked"}));
  return {...island,id:island.slug,totalLevels:levels.length,levels,lastCompletedAt};
}
async function listIslands(user) {
  const islands=await Island.find().select("slug").lean();
  return Promise.all(islands.map(island=>getIsland(user,island.slug)));
}
module.exports={getMission,getEditorial,getIsland,listIslands};
