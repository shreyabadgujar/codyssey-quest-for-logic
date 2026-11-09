const { setTimeout: sleep } = require("node:timers/promises");
const DEFAULT_IDS = { c: 50, cpp: 54, java: 62, python: 71 };
const NAMES = { c: /^C \(/, cpp: /^C\+\+ \(/, java: /^Java \(/, python: /^Python \(3\./ };
const DEFAULT_LIMITS = Object.freeze({ cpu: 2, wall: 10, memory: 262144 });
function checkedLimits(limits = DEFAULT_LIMITS) {
  const value = { ...DEFAULT_LIMITS, ...limits };
  if (!Number.isFinite(value.cpu) || value.cpu < 0.1 || value.cpu > 10 ||
      !Number.isFinite(value.wall) || value.wall < value.cpu || value.wall > 30 ||
      !Number.isInteger(value.memory) || value.memory < 16384 || value.memory > 524288) throw new Error("Invalid judge limits");
  return value;
}
function createJudgeClient({ url, key, rapidApiHost, languageIds = DEFAULT_IDS,
  fetchImpl = globalThis.fetch, pause = sleep, pollLimit = 60 } = {}) {
  let languages;
  async function request(path, body, deadline) {
    if (!url) throw new Error("Judge0 is not configured");
    const base = new URL(url);
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) throw new Error("Invalid judge URL");
    const remaining = Math.min(10000, (deadline ?? Date.now() + 10000) - Date.now());
    if (remaining <= 0) throw new Error("Judge deadline exceeded");
    const headers = { "Content-Type": "application/json" };
    if (key) headers[rapidApiHost ? "X-RapidAPI-Key" : "X-Auth-Token"] = key;
    if (rapidApiHost) headers["X-RapidAPI-Host"] = rapidApiHost;
    const response = await fetchImpl(`${url.replace(/\/$/, "")}${path}`, {
      method: body ? "POST" : "GET", headers, redirect: "error", signal: AbortSignal.timeout(remaining),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error("Judge request failed");
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 2 * 1024 * 1024) throw new Error("Judge response too large");
        chunks.push(Buffer.from(value));
      }
    } finally { await reader.cancel(); }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  }
  async function verifyLanguages(deadline) {
    if (!languages) languages = request("/languages", undefined, deadline).then((available) => {
      if (!Array.isArray(available)) throw new Error("Invalid language catalog");
      for (const [language, id] of Object.entries(languageIds)) {
        if (!NAMES[language] || !Number.isInteger(id) || !available.some((item) => item.id === id && NAMES[language].test(item.name))) throw new Error("Configured judge language unavailable");
      }
      return available;
    }).catch((error) => { languages = undefined; throw error; });
    return languages;
  }
  async function execute({ code, language, input, limits, deadline }) {
    if (!Object.hasOwn(languageIds, language)) throw new Error("Unsupported language");
    if (typeof input !== "string" || Buffer.byteLength(input) > 1024 * 1024) throw new Error("Input too large");
    const bounded = checkedLimits(limits);
    await verifyLanguages(deadline);
    const tokenResult = await request("/submissions?base64_encoded=true&wait=false", {
      source_code: Buffer.from(code).toString("base64"), stdin: Buffer.from(input).toString("base64"), language_id: languageIds[language],
      ...(language === "cpp" ? { compiler_options: "-std=c++17" } : {}),
      cpu_time_limit: bounded.cpu, cpu_extra_time: 0.5, wall_time_limit: bounded.wall,
      memory_limit: bounded.memory, max_file_size: 256, number_of_runs: 1,
      enable_network: false, redirect_stderr_to_stdout: false,
    }, deadline);
    if (typeof tokenResult.token !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(tokenResult.token)) throw new Error("Invalid judge token");
    for (let attempt = 0; attempt < pollLimit; attempt++) {
      const result = await request(`/submissions/${tokenResult.token}?base64_encoded=true&fields=status,stdout,stderr,compile_output,time,memory,exit_code,exit_signal`, undefined, deadline);
      if ([1, 2].includes(result?.status?.id)) { await pause(500); continue; }
      for (const field of ["stdout", "stderr", "compile_output"]) {
        const encoded = result[field];
        if (encoded == null) { result[field] = null; continue; }
        if (typeof encoded !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) throw new Error("Invalid encoded output");
        result[field] = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.from(encoded, "base64"));
      }
      return result;
    }
    throw new Error("Judge polling timed out");
  }
  return { execute, verifyLanguages };
}
let client;
function getClient() {
  if (!client) client = createJudgeClient({ url: process.env.JUDGE0_API_URL, key: process.env.JUDGE0_API_KEY,
    rapidApiHost: process.env.JUDGE0_RAPIDAPI_HOST,
    languageIds: Object.fromEntries(Object.entries(DEFAULT_IDS).map(([key, id]) => [key, Number(process.env[`JUDGE0_LANGUAGE_${key.toUpperCase()}`] || id)])),
  });
  return client;
}
module.exports = { createJudgeClient, getClient, checkedLimits, DEFAULT_IDS, DEFAULT_LIMITS };
