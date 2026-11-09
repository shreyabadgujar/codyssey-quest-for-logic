const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createPuzzleService, finishedMissionFilter } = require("../services/puzzleService");
const { createRewardService } = require("../services/rewardService");
const { bank, byId } = require("../data/puzzles");
const expansion = require("../data/puzzles/expansion");
const arrayExpansion = require("../data/puzzles/arrayArchipelago");
const { shortestRoute } = require("../services/puzzleValidationService");
const { buildJournal } = require("../services/profileService");
const { unlockEligible } = require("../services/achievementService");

function fixture(missionsTotal = 87) {
  const db = { rows: [], records: [], coins: new Map(), unlocked: new Set() };
  const matches=(row,query)=>Object.entries(query).every(([key,value])=>row[key]===value);
  let tail=Promise.resolve();
  const connection={ transaction(fn) {
    const task=tail.then(async()=>{
      const snapshot=structuredClone(db);
      try{return await fn({ transaction:true });}catch(err){Object.assign(db,snapshot);throw err;}
    });
    tail=task.catch(()=>{});
    return task;
  }};
  const lean=fn=>({lean:async()=>structuredClone(fn()),session(){return this;},sort(){return this;}});
  const options={ connection,random:()=>0,
    Missions:{countDocuments:()=>({session:async()=>missionsTotal})},
    Islands:{find:()=>({select:()=>lean(()=>[{slug:"graphbound-kingdom",name:"Graphbound Kingdom"}])})},
    Records:{countDocuments:query=>({session:async()=>new Set(db.records.filter(r=>matches(r,query)).map(r=>r.mission)).size})},
    Sessions:{
      find:query=>lean(()=>db.rows.filter(r=>matches(r,query)).sort((a,b)=>a.milestone-b.milestone)),
      findOne:query=>lean(()=>db.rows.find(r=>matches(r,query))),
      async insertMany(rows){
        return rows.map(row=>{
          if (db.rows.some(existing=>existing.user===row.user&&(existing.milestone===row.milestone||existing.puzzleId===row.puzzleId))) {
            throw Object.assign(new Error("Duplicate key"),{code:11000});
          }
          const record={...row,_id:(db.rows.length+1).toString(16).padStart(24,"0"),status:"available",revision:0,draft:{},hintsUsed:0,attempts:0,coinsAwarded:0};
          db.rows.push(record);
          return structuredClone(record);
        });
      },
      findOneAndUpdate(query,update){
        return lean(()=>{
          const row=db.rows.find(r=>matches(r,query));
          if(!row)return null;
          Object.assign(row,update.$set);
          for(const [key,value] of Object.entries(update.$inc))row[key]+=value;
          for(const key of Object.keys(update.$unset||{}))delete row[key];
          return row;
        });
      },
    },
    Users:{ async updateOne(query, update, {session}) {
      assert.equal(session.transaction,true);
      if (query["achievements.achievement"]) {
        const entry=update.$push.achievements;
        const key=query._id+":"+entry.achievement;
        if(db.unlocked.has(key))return {modifiedCount:0};
        db.unlocked.add(key);
        return {modifiedCount:1};
      }
      db.coins.set(query._id,(db.coins.get(query._id)||0)+update.$inc.coins);
      return {matchedCount:1};
    }},
  };
  options.unlock=(user,stats,session)=>unlockEligible(user,stats,session,options.Users);
  const service=createPuzzleService(options);
  function add(user,mission,passed=true) {
    db.records.push({...finishedMissionFilter(user),mission,...(!passed?{status:"in_progress",rewardsGranted:false}:{})});
  }
  return {db,service,options,add};
}
const doAct=(service,user,row,action,draft)=>service.act(user,row.id,action,{revision:row.revision,...(draft?{draft}:{})});
async function ready({service,add},user) {
  add(user,"mission-one");add(user,"mission-two");
  return service.open(user,(await service.lobby(user)).current.id);
}
test("only distinct rewarded successful missions unlock; parallel and repeated lobby reads do not reroll",async()=>{
  const f=fixture();
  f.add("a","one");
  f.add("a","two",false);
  f.add("b","one");
  assert.equal((await f.service.lobby("a")).current,null);
  f.add("a","one");
  assert.equal((await f.service.lobby("a")).missionsToNext,1);
  f.add("a","two");
  const [first,second]=await Promise.all([f.service.lobby("a"),f.service.lobby("a")]);
  assert.equal(first.current.milestone,2);
  assert.deepEqual(first,second);
  assert.equal(f.db.rows.length,1);
  assert.equal((await f.service.lobby("b")).current,null);
});

test("catalogue exposes all islands and only public previews before any assignments are earned", async () => {
  const { service, add, db } = fixture();
  const initial = await service.lobby("a");
  assert.equal(initial.missionsToNext, 2);
  assert.equal(initial.catalogue.length, 60);
  const islandCounts = new Map();
  for (const row of initial.catalogue) {
    islandCounts.set(row.islandId, (islandCounts.get(row.islandId) ?? 0) + 1);
    assert.deepEqual(Object.keys(row).filter(key => key !== "tags").sort(), [
      "difficulty", "islandId", "islandName", "mechanic", "puzzleId", "status", "synopsis", "title",
    ]);
    assert.ok(row.synopsis.trim());
    assert.equal(row.status, "locked");
  }
  assert.equal(islandCounts.size, 10);
  assert.ok([...islandCounts.values()].every(count => count === 6));
  assert.equal(initial.catalogue.find(row => row.islandId === "tree-of-secrets").islandName, "Tree of Secrets");
  assert.equal(initial.catalogue.find(row => row.islandId === "stack-queue-depths").islandName, "Stack & Queue Depths");
  add("a", "mission-one");
  const next = await service.lobby("a");
  assert.equal(next.missionsToNext, 1);
  assert.ok(next.catalogue.every(row => row.status === "upcoming" && !row.sessionId));
  assert.equal(db.rows.length, 0);
  await assert.rejects(service.act("a", next.catalogue[0].puzzleId, "start", { revision: 0 }), { code: "PUZZLE_NOT_FOUND" });
  assert.equal(db.rows.length, 0);
});

test("catalogue statuses track only the player's assignments, skip, and completed rewards", async () => {
  const f = fixture();
  let row = await ready(f, "a");
  const selected = lobby => lobby.catalogue.find(entry => entry.puzzleId === row.puzzleId);
  const initial = await f.service.lobby("a");
  assert.equal(selected(initial).status, "available");
  assert.equal(selected(initial).sessionId, row.id);
  assert.equal(initial.missionsToNext, 2);
  assert.equal(initial.catalogue.filter(entry => entry.status === "locked").length, 59);

  row = await doAct(f.service, "a", row, "start");
  assert.equal(selected(await f.service.lobby("a")).sessionStatus, "active");
  row = await doAct(f.service, "a", row, "skip");
  assert.equal(selected(await f.service.lobby("a")).status, "available");
  assert.equal(selected(await f.service.lobby("a")).sessionStatus, "skipped");
  row = await doAct(f.service, "a", row, "start");
  row = await doAct(f.service, "a", row, "draft", byId.get(row.puzzleId).solution);
  const won = await doAct(f.service, "a", row, "submit");
  assert.equal(selected(await f.service.lobby("a")).status, "completed");
  assert.equal((await doAct(f.service, "a", won, "submit")).alreadyRewarded, true);
  assert.equal(f.db.coins.get("a"), won.awarded);
  const other = selected(await f.service.lobby("b"));
  assert.equal(other.status, "locked");
  assert.ok(!other.sessionId && !other.sessionStatus);
  await assert.rejects(doAct(f.service, "b", row, "start"), { code: "PUZZLE_NOT_FOUND" });

  f.add("a", "mission-three");
  const approaching = await f.service.lobby("a");
  assert.equal(approaching.missionsToNext, 1);
  assert.equal(approaching.catalogue.filter(entry => entry.status === "upcoming").length, 50);
  assert.equal(approaching.catalogue.filter(entry => entry.status === "locked").length, 9);
  f.add("a", "mission-four");
  const refreshed = await createPuzzleService(f.options).lobby("a");
  assert.equal(refreshed.history.length, 2);
  assert.equal(refreshed.missionsToNext, 2);
  assert.equal(refreshed.catalogue.filter(entry => entry.status === "available").length, 1);
  assert.equal(selected(refreshed).sessionId, row.id);
});

test("legacy sessions survive and 87 missions earn only 43 of the 60 catalogue entries", async () => {
  const f = fixture();
  const original = bank.filter(puzzle => !puzzle.tags);
  const existing = await f.options.Sessions.insertMany(original.map((puzzle, i) =>
    ({ user: "a", milestone: 2*(i+1), puzzleId: puzzle.id })));
  const completed = f.db.rows[0];
  const credited = byId.get(completed.puzzleId).coins;
  Object.assign(completed, { status: "completed", coinsAwarded: credited, completedAt: new Date("2026-01-01") });
  f.db.rows[1].status = "skipped";
  f.db.coins.set("a", credited);
  const storedHistory = structuredClone(f.db.rows);
  for (let i=1; i<=60; i++) f.add("a", "mission-"+i);
  assert.equal((await f.service.lobby("a")).history.length, 30);
  f.add("a", "mission-61");
  assert.equal((await f.service.lobby("a")).history.length, 30);
  f.add("a", "mission-62");
  const at62 = await f.service.lobby("a");
  assert.equal(at62.history.length, 31);
  assert.ok(expansion.some(puzzle => puzzle.id === at62.history[0].puzzleId));
  for (let i=63; i<=87; i++) f.add("a", "mission-"+i);
  const final = await f.service.lobby("a");
  assert.equal(final.history.length, 43);
  assert.equal(final.missionsTotal, 87);
  assert.equal(final.nextReachable, false);
  assert.equal(final.exhausted, false);
  assert.equal(final.catalogue.filter(row => row.status === "locked").length, 17);
  for (const row of existing) assert.equal(final.history.find(session => session.puzzleId === row.puzzleId).id, row._id);
  assert.deepEqual(f.db.rows.slice(0, existing.length), storedHistory);
  assert.equal(f.db.coins.get("a"), credited);
  assert.deepEqual(await f.service.lobby("a"), final);
});

test("all 30 expansion puzzles accept their playable interactions, release hints and explanations, and award coins once", async () => {
  const f = fixture(120);
  for (let i=1; i<=120; i++) f.add("a", "mission-"+i);
  const lobby = await f.service.lobby("a");
  assert.equal(lobby.history.length,60);
  assert.equal(lobby.exhausted,true);
  let balance = 0;
  for (const puzzle of [...expansion, ...arrayExpansion]) {
    const id = lobby.history.find(row => row.puzzleId === puzzle.id).id;
    let row = await f.service.open("a", id);
    assert.deepEqual(row.puzzle.tags,puzzle.tags);
    assert.equal(row.puzzle.solution,undefined);
    row = await doAct(f.service,"a",row,"start");
    const incomplete = await doAct(f.service,"a",row,"submit");
    assert.equal(incomplete.verdict,"incomplete",puzzle.id);
    row = incomplete;
    for (let i=1; i<=3; i++) {
      row = await doAct(f.service,"a",row,"hint");
      assert.deepEqual(row.hints,puzzle.hints.slice(0,i));
      assert.equal(row.explanation,undefined);
    }
    const solution = puzzle.solution;
    const draft = {
      detective: () => solution,
      arrangement: () => ({steps:solution.witness.map(([id,turn])=>({id,turn}))}),
      maze: () => ({moves:shortestRoute(puzzle.data).moves}),
      workshop: () => ({operations:solution.witness}),
      cipher: () => ({wheel:puzzle.data.alignment, mapping:Object.fromEntries(puzzle.data.symbols.map(symbol=>[symbol,solution.key[symbol]])), message:solution.answer}),
      code: () => solution,
    }[puzzle.mechanic]();
    row = await doAct(f.service,"a",row,"draft",draft);
    const won = await doAct(f.service,"a",row,"submit");
    assert.equal(won.status,"completed",puzzle.id);
    assert.equal(won.awarded,puzzle.coins);
    assert.equal(won.explanation,puzzle.explanation);
    assert.equal((await f.service.open("a",id)).explanation,puzzle.explanation);
    assert.equal((await doAct(f.service,"a",won,"submit")).alreadyRewarded,true);
    balance += puzzle.coins;
    assert.equal(f.db.coins.get("a"),balance);
  }
  assert.equal(f.db.unlocked.size,1);
});

test("pending drafts and progressive hints survive new service instances; skip and revisit preserve work",async()=>{
  const f=fixture();
  let row=await ready(f,"a");
  const original=row;
  assert.equal(row.status,"available");
  assert.equal(row.hints.length,0);
  row=await doAct(f.service,"a",row,"start");
  const stale=row;
  row=await doAct(f.service,"a",row,"draft",{suspect:"ida",evidence:["drawer"]});
  const resumed=createPuzzleService(f.options);
  assert.deepEqual((await resumed.open("a",row.id)).draft,row.draft);
  await assert.rejects(doAct(resumed,"a",stale,"reset"),{code:"PUZZLE_CONFLICT"});
  for(let i=0;i<4;i++){
    row=await doAct(resumed,"a",row,"hint");
    assert.equal(row.hints.length,Math.min(3,i+1));
  }
  assert.equal(row.explanation,undefined);
  row=await doAct(resumed,"a",row,"submit");
  assert.equal(row.verdict,"incomplete");
  assert.equal(row.attempts,1);
  row=await doAct(resumed,"a",row,"skip");
  assert.equal((await resumed.lobby("a")).current,null);
  assert.equal((await resumed.lobby("a")).history[0].status,"skipped");
  await assert.rejects(doAct(resumed,"a",row,"submit"),{code:"PUZZLE_NOT_ACTIVE"});
  row=await doAct(resumed,"a",row,"start");
  assert.equal(row.puzzleId,original.puzzleId);
  assert.equal(row.draft.suspect,"ida");
  row=await doAct(resumed,"a",row,"reset");
  assert.deepEqual(row.draft,{});
  assert.equal(row.verdict,undefined);
  assert.equal(row.hints.length,3);
  assert.equal(row.attempts,1);
});

test("authenticated ownership and payload validation reject tampering; only one concurrent solve credits coins",async()=>{
  const f=fixture();
  let row=await ready(f,"a");
  await assert.rejects(f.service.open("b",row.id),{status:404});
  await assert.rejects(doAct(f.service,"b",row,"start"),{status:404});
  await assert.rejects(f.service.open("a","not-a-mongo-id"),{status:404});
  await assert.rejects(f.service.act("a",row.id,"start",{revision:0,coins:100}),{status:400});
  row=await doAct(f.service,"a",row,"start");
  await assert.rejects(doAct(f.service,"a",row,"draft",{suspect:"hacker"}),{status:400});
  await assert.rejects(doAct(f.service,"a",row,"draft",{coins:100}),{status:400});
  const solution=byId.get(row.puzzleId).solution;
  row=await doAct(f.service,"a",row,"draft",{...solution,suspect:"ida"});
  row=await doAct(f.service,"a",row,"submit");
  assert.equal(row.verdict,"incorrect");
  assert.equal(f.db.coins.get("a"),undefined);
  row=await doAct(f.service,"a",row,"draft",solution);
  const results=await Promise.all([doAct(f.service,"a",row,"submit"),doAct(f.service,"a",row,"submit")]);
  assert.equal(results.filter(r=>r.awarded===row.coins).length,1);
  assert.equal(results.filter(r=>r.alreadyRewarded).length,1);
  assert.equal(f.db.coins.get("a"),row.coins);
  assert.equal(f.db.unlocked.size,1);
  const awarded=results.find(r=>r.awarded);
  assert.equal(awarded.achievements[0].name,"First Mystery Solved");
  assert.equal(awarded.status,"completed");
  assert.ok(awarded.explanation);
  assert.equal((await f.service.lobby("a")).history[0].coinsAwarded,row.coins);
  const journal=buildJournal({player:{coins:row.coins},islands:[],missions:[],progress:[],shopItems:[],
    badges:{items:[],summary:{unlocked:0,titles:[]}},solvedPuzzles:f.db.rows});
  assert.equal(journal.activity[0].href,"/puzzles/"+row.id);
  assert.equal(journal.activity[0].kind,"puzzle");
  assert.equal(journal.activity[0].coins,row.coins);
});

test("a reward transaction failure rolls back the puzzle completion; retry grants once",async()=>{
  const f=fixture();
  let row=await ready(f,"a");
  row=await doAct(f.service,"a",row,"start");
  row=await doAct(f.service,"a",row,"draft",byId.get(row.puzzleId).solution);
  const failing=createPuzzleService({...f.options,unlock:async()=>{throw Error("Test rollback");}});
  await assert.rejects(doAct(failing,"a",row,"submit"),/Test rollback/);
  assert.equal((await f.service.open("a",row.id)).status,"active");
  assert.equal(f.db.coins.get("a"),undefined);
  assert.equal((await doAct(f.service,"a",row,"submit")).awarded,row.coins);
});

test("coding reward response advertises exactly the even first completions inside the transaction",async()=>{
  let completionCount=0;
  const rows=new Map(),session={};
  const grant=createRewardService({connection:{transaction:fn=>fn(session)},
    LeaseModel:{updateOne:async()=>({matchedCount:1})},
    ProgressModel:{
      findOne:({mission})=>({session:async()=>rows.get(mission)}),
      updateOne:async({mission},update)=>{rows.set(mission,update.$set);completionCount++;},
    },
    UserModel:{updateOne:async()=>({matchedCount:1})},unlock:async()=>[],
    puzzleCount:async(user,txn)=>{assert.equal(user,"a");assert.equal(txn,session);return completionCount;},
  });
  const complete=_id=>grant("a",{_id,island:"i",xpReward:5,coinReward:5},"cpp","owner");
  assert.equal((await complete("1")).puzzleMilestone,undefined);
  assert.equal((await complete("2")).puzzleMilestone,2);
  assert.equal((await complete("2")).puzzleMilestone,undefined);
  assert.equal((await complete("3")).puzzleMilestone,undefined);
  assert.equal((await complete("4")).puzzleMilestone,4);
});

test("puzzle HTTP router requires authentication before dispatching any action", async () => {
  const router = require("../routes/puzzleRoutes");
  assert.equal(router.stack[0].handle, require("../middleware/auth"));
  assert.deepEqual(router.stack.slice(1).map(layer => layer.route.path), ["/","/:id","/:id/:action"]);
  for (const authorization of [undefined,"Basic invalid","Bearer not-a-jwt"]) {
    let status, body;
    await router.stack[0].handle({ headers:{authorization} }, {
      status(value){status=value;return this;},
      json(value){body=value;},
    },()=>assert.fail("Unauthenticated request reached the controller"));
    assert.equal(status,401);
    assert.ok(["UNAUTHORIZED","INVALID_TOKEN"].includes(body.error.code));
  }
});
