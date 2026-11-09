require("dotenv").config();
const fs=require("node:fs");
const path=require("node:path");
const mongoose=require("mongoose");
const Island=require("../models/Island");
const Mission=require("../models/Mission");
const {missions}=require("../data/arrayMissions");
const {validateReferences,isValidated}=require("../services/missionValidationService");
const {getClient}=require("../services/judge0Service");
(async()=>{
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([Mission.init(),Island.init()]);
  const island=await Island.findOneAndUpdate({slug:"array-archipelago"},{$set:{name:"Array Archipelago",topic:"Arrays",order:1,totalLevels:15,
    description:"Investigate the vanished harbour ledger across fifteen cases of increasing difficulty.",image:"/assets/islands/array-archipelago.webp",
    mapPosition:{x:21,y:36},completionReward:{coins:150,xp:300,artifact:"The Chronometer of Indirection"}}},{upsert:true,new:true});
  const report=[];
  for(const entry of missions){
    const existing=await Mission.findOne({island:island._id,level:entry.level}).select("+hiddenTestCases +referenceSolutions +executionLimits +validator +validation").lean();
    const document=await Mission.findOneAndUpdate({island:island._id,level:entry.level},{$set:{...entry,island:island._id}}, {upsert:true,new:true,runValidators:true})
      .select("+hiddenTestCases +referenceSolutions +executionLimits +validator +validation").lean();
    if(!isValidated(document)){
      await Mission.updateOne({_id:document._id},{$unset:{validation:1}});
      console.log(`Q${entry.level}: validating ${entry.title} in C++17, Java, Python`);
      try{
        const validation=await validateReferences(document,getClient().execute);
        await Mission.updateOne({_id:document._id},{$set:{validation}});
        report.push({level:entry.level,id:String(document._id),title:entry.title,status:"passed",languages:validation.languages,testsPerLanguage:entry.sampleTestCases.length+entry.hiddenTestCases.length});
      }catch(error){report.push({level:entry.level,title:entry.title,status:"failed",reason:error.message});}
    }else report.push({level:entry.level,id:String(document._id),title:entry.title,status:"passed",languages:document.validation.languages,testsPerLanguage:entry.sampleTestCases.length+entry.hiddenTestCases.length});
    fs.mkdirSync(path.join(__dirname,"../validation"),{recursive:true});
    fs.writeFileSync(path.join(__dirname,"../validation/array-report.json"),JSON.stringify({at:new Date().toISOString(),missions:report},null,2));
    console.log(`Q${entry.level}: ${report.at(-1).status}`);
  }
  if(report.some(r=>r.status!=="passed"))process.exitCode=1;
})().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>mongoose.disconnect());
