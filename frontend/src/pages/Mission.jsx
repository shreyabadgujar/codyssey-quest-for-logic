import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, Play, Send, RotateCcw } from "lucide-react";
import CodeEditorWrapper from "../components/CodeEditorWrapper.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import OutputConsole from "../components/OutputConsole.jsx";
import TestCaseResults from "../components/TestCaseResults.jsx";
import AchievementBadge from "../components/AchievementBadge.jsx";
import { getMission, getEditorial, runCode, submitCode } from "../services/gameService.js";
import { getMe } from "../services/authService.js";
import { useAuth } from "../hooks/useAuth.js";
import { refreshProgress } from "../game/progression.js";

export default function Mission() {
  const { missionId } = useParams();
  const { setUser } = useAuth();
  const [mission,setMission]=useState(null);
  const [error,setError]=useState("");
  const [language,setLanguage]=useState("cpp");
  const [drafts,setDrafts]=useState({});
  const [tab,setTab]=useState("statement");
  const [editorial,setEditorial]=useState(null);
  const [busy,setBusy]=useState("");
  const [result,setResult]=useState(null);
  const [useCustom,setUseCustom]=useState(false);
  const [input,setInput]=useState("");
  const generation=useRef(0);
  useEffect(()=>{
    const current=++generation.current;
    setMission(null);setError("");setResult(null);setEditorial(null);setTab("statement");setBusy("");setUseCustom(false);setInput("");
    getMission(missionId).then(data=>{
      if(current!==generation.current)return;
      setMission(data);setDrafts(data.starterCode || {});
    }).catch(err=>{if(current===generation.current)setError(err.message);});
    return ()=>{generation.current++;};
  },[missionId]);
  async function execute(mode){
    if(busy||!mission)return;
    const current=generation.current;
    setBusy(mode);setError("");setResult(null);
    try{
      const payload={missionId:mission.id,language,code:drafts[language] || ""};
      const response=mode==="Run"?await runCode({...payload,...(useCustom?{input}:{})}):await submitCode(payload);
      if(current!==generation.current)return;
      setResult({...response,mode});
      if(mode==="Submit"&&response.passed){
        setMission(previous=>({...previous,completed:true}));
        await refreshProgress();
        const updated=await getMe();setUser(updated);
      }
    }catch(err){if(current===generation.current)setError(err.message || "Execution could not be completed.");}
    finally{if(current===generation.current)setBusy("");}
  }
  async function revealEditorial(){
    try{setEditorial(await getEditorial(mission.id));}catch(err){setError(err.message);}
  }
  if(!mission)return <section className="folio space-y-4"><h1 className="text-2xl">Case File</h1><p role={error?"alert":"status"}>{error || "Retrieving the case from the archive…"}</p><Link to="/map">Return to the World Map</Link></section>;
  const output=(result?.results || []).filter(r=>!r.hidden).map((r,i)=>`Test ${i+1}\n${r.compileOutput || r.stderr || r.stdout || "(empty output)"}`).join("\n\n");
  const difficulty={apprentice:"Easy",journeyman:"Medium",master:"Hard"}[mission.difficulty];
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link to={`/islands/${mission.islandId}`} className="btn-ghost text-sm no-underline">← {mission.islandName}</Link>
      <span className="annotation">Case {mission.level}{mission.totalLevels ? ` of ${mission.totalLevels}` : ""} · {mission.stage} · {difficulty} · {mission.completed?"Completed":"Unsolved"}</span>
    </div>
    <header className="paper p-4 border border-ink/30"><h1 className="text-2xl sm:text-3xl">{mission.title}</h1><p className="annotation mt-2">{mission.introduction}</p></header>
    {error&&<p role="alert" className="paper p-3 border border-oxblood text-oxblood">{error}</p>}
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <section className="folio p-4 min-w-0">
        <nav aria-label="Case file sections" className="flex gap-2 flex-wrap border-b border-ink/30 pb-3 mb-4">
          {[["statement","Problem"],["hints","Hints"],["editorial","Editorial"]].map(([id,label])=><button key={id} className={tab===id?"btn-brass text-sm px-3":"btn-ghost text-sm px-3"} onClick={()=>setTab(id)} aria-pressed={tab===id}>{label}</button>)}
        </nav>
        <div className="space-y-5 lg:max-h-[720px] overflow-y-auto pr-2 custom-parchment-scrollbar">
          {tab==="statement"&&<>
            <section><h2 className="text-xl mb-2">Investigation objective</h2><p>{mission.description}</p></section>
            <section><h2 className="text-xl mb-2">Input format</h2><p>{mission.inputFormat}</p></section>
            <section><h2 className="text-xl mb-2">Output format</h2><p>{mission.outputFormat}</p></section>
            <section><h2 className="text-xl mb-2">Constraints</h2><p>{mission.constraints}</p></section>
            {mission.sampleTestCases.map((sample,i)=><section key={i} className="paper border border-ink/20 p-3 space-y-2"><h2 className="text-xl">Example {i+1}</h2><h3>Input</h3><pre className="field font-mono text-sm whitespace-pre-wrap">{sample.input}</pre><h3>Output</h3><pre className="field font-mono text-sm whitespace-pre-wrap">{sample.expectedOutput}</pre><p className="text-sm"><strong>Explanation: </strong>{sample.explanation}</p></section>)}
          </>}
          {tab==="hints"&&mission.hints.map((hint,i)=><details key={i} className="paper p-3 border border-ink/20"><summary className="cursor-pointer font-display">Hint {i+1}</summary><p className="mt-2">{hint}</p></details>)}
          {tab==="editorial"&&(editorial?<><h2 className="text-xl">Solution reasoning</h2><p>{editorial.explanation}</p><p><strong>Time:</strong> {editorial.timeComplexity}</p><p><strong>Auxiliary space:</strong> {editorial.spaceComplexity}</p></>:<div className="space-y-3"><p>The editorial explains the algorithm and its correctness. Reveal it when you are ready to read the solution.</p><button onClick={revealEditorial} className="btn-brass"><BookOpen size={16}/>Reveal editorial</button></div>)}
        </div>
      </section>
      <section className="min-w-0 space-y-3" aria-label="Coding laboratory">
        <div className="paper p-3 border border-ink/30 flex flex-wrap items-center justify-between gap-2"><LanguageSelector value={language} onChange={setLanguage}/><button disabled={Boolean(busy)} className="btn-ghost text-xs px-2" onClick={()=>setDrafts(prev=>({...prev,[language]:mission.starterCode[language]}))}><RotateCcw size={14}/>Reset code</button></div>
        <CodeEditorWrapper language={language} value={drafts[language]||""} onChange={code=>setDrafts(prev=>({...prev,[language]:code}))}/>
        <div className="paper p-3 border border-ink/30 space-y-3">
          <label className="flex gap-2 items-center"><input type="checkbox" checked={useCustom} onChange={e=>setUseCustom(e.target.checked)}/>Use custom input for Run</label>
          {useCustom&&<textarea aria-label="Custom input" className="field font-mono text-sm" rows={4} value={input} onChange={e=>setInput(e.target.value)}/>}
          <div className="flex flex-wrap gap-3"><button className="btn-ghost" disabled={Boolean(busy)} onClick={()=>execute("Run")}><Play size={16}/>{busy==="Run"?"Running…":"Run"}</button><button className="btn-brass" disabled={Boolean(busy)} onClick={()=>execute("Submit")}><Send size={16}/>{busy==="Submit"?"Judging…":"Submit"}</button><span className="annotation text-xs self-center">First completion: {mission.xpReward} XP · {mission.coinReward} coins</span></div>
          <p className="text-xs">Run checks examples or custom input. Submit checks every required test and awards first-completion rewards.</p>
        </div>
      </section>
    </div>
    <section className="folio p-4 space-y-3" aria-label="Execution results" aria-live="polite">
      <h2 className="text-xl">Execution log</h2>
      {busy&&<p role="status">{busy==="Submit"?"Evaluating the complete test suite…":"Executing code…"}</p>}
      {result&&<><p className="font-display text-xl">{result.mode}: {result.verdict}{result.mode==="Run"&&result.verdict==="Accepted"?" (visible samples only)":""}</p>{result.message&&<p>{result.message}</p>}<TestCaseResults results={result.results}/></>}
      <OutputConsole output={output} isRunning={Boolean(busy)}/>
      {result?.rewards?.achievements?.length > 0 && (
        <div className="paper space-y-2 border-2 border-brass p-3" role="status">
          <h3 className="text-xl">Achievement Unlocked!</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.rewards.achievements.map(item => <AchievementBadge key={item.key} achievement={item} />)}
          </div>
        </div>
      )}
      {result?.rewards&&<div className="paper p-4 border-2 border-brass space-y-2"><h3 className="text-xl">Case solved</h3><p>{result.rewards.firstCompletion?`Awarded ${result.rewards.xp} XP and ${result.rewards.coins} coins.`:"Previously completed — no duplicate rewards."}</p><p>{result.clue}</p>{mission.nextMissionId&&<Link className="btn-brass no-underline" to={`/missions/${mission.nextMissionId}`}>Open Case {mission.level+1} →</Link>}</div>}
    </section>
  </div>;
}
