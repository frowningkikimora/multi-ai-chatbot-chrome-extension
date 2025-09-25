const chatEl   = document.getElementById("chat");
const inputEl  = document.getElementById("input");
const sendBtn  = document.getElementById("send");
const stopBtn  = document.getElementById("stop");
const metaEl   = document.getElementById("meta");

const tUser    = document.getElementById("msg-user");
const tAsst    = document.getElementById("msg-assistant");

let history = [{ role: "system", content: "You are a helpful, concise assistant." }];
let abortCtrl = null;

function appendMessage(role, text="") {
  const tmpl = role === "user" ? tUser : tAsst;
  const node = tmpl.content.cloneNode(true);
  const bubble = node.querySelector(".bubble");
  bubble.textContent = text;
  node.firstElementChild.classList.add("fade-in");
  chatEl.appendChild(node);
  chatEl.scrollTop = chatEl.scrollHeight;
  return bubble;
}

function autosize() {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";
}
inputEl.addEventListener("input", autosize);

function setBusy(busy){
  sendBtn.disabled = busy;
  stopBtn.disabled = !busy;
  if (busy) inputEl.setAttribute("disabled", "true"); else inputEl.removeAttribute("disabled");
}

function updateMeta({provider, openaiModel, geminiModel, openrouterModel, groqModel, deepseekModel}){
  let label = "OpenAI";
  let model = openaiModel;
  if (provider === "gemini") { label = "Gemini"; model = geminiModel; }
  if (provider === "openrouter") { label = "OpenRouter"; model = openrouterModel; }
  if (provider === "groq") { label = "Groq"; model = groqModel; }
  if (provider === "deepseek") { label = "DeepSeek"; model = deepseekModel; }
  metaEl.textContent = `${label} • ${model || "—"}`;
}

function getSettings(){
  return new Promise(r=>{
    chrome.storage.sync.get({
      provider:"openai",
      openaiApiKey:"", openaiModel:"gpt-5",
      geminiApiKey:"", geminiModel:"gemini-1.5-flash",
      openrouterApiKey:"", openrouterModel:"openrouter/auto",
      groqApiKey:"", groqModel:"llama-3.1-8b-instant",
      deepseekApiKey:"", deepseekModel:"deepseek-chat"
    },d=>{ updateMeta(d); r(d); });
  });
}

/* ---------- Providers ---------- */
async function callOpenAI({ apiKey, model, messages, signal }){
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST", signal,
    headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0 })
  });
  if(!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function toGeminiPayload(history){
  const contents=[]; let sys="";
  for(const m of history){
    if(m.role==="system"){ sys+=(sys?"\n":"")+m.content; continue; }
    contents.push({ role: m.role==="assistant" ? "model" : "user", parts:[{text:m.content}] });
  }
  const payload={ contents, generationConfig:{ temperature:0 } };
  if(sys) payload.system_instruction = { parts:[{ text: sys }] };
  return payload;
}

async function callGemini({ apiKey, model, messages, signal }){
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method:"POST", signal,
    headers:{ "Content-Type":"application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(toGeminiPayload(messages))
  });
  if(!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map(p=>p.text).join("") || "";
}

async function callOpenRouter({ apiKey, model, messages, signal }){
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST", signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "X-Title": "GPT-Gemini-OpenRouter-Groq-DeepSeek Chatbot"
    },
    body: JSON.stringify({ model, messages, temperature: 0 })
  });
  if(!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/* Groq (OpenAI-compatible endpoint) */
async function callGroq({ apiKey, model, messages, signal }){
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages, temperature: 0 })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/* NEW: DeepSeek (OpenAI-compatible style) */
async function callDeepSeek({ apiKey, model, messages, signal }){
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST", signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages, temperature: 0 })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/* ---------- Send flow ---------- */
async function sendMessage(){
  const userText = inputEl.value.trim();
  if(!userText) return;
  inputEl.value = ""; autosize();

  history.push({ role:"user", content:userText });
  appendMessage("user", userText);

  const set = await getSettings();
  const bubble = appendMessage("assistant", "…");
  abortCtrl = new AbortController();

  try{
    setBusy(true);
    let text = "";
    if (set.provider === "gemini") {
      text = await callGemini({ apiKey:set.geminiApiKey, model:set.geminiModel, messages:history, signal:abortCtrl.signal });
    } else if (set.provider === "openrouter") {
      text = await callOpenRouter({ apiKey:set.openrouterApiKey, model:set.openrouterModel, messages:history, signal:abortCtrl.signal });
    } else if (set.provider === "groq") {
      text = await callGroq({ apiKey:set.groqApiKey, model:set.groqModel, messages:history, signal:abortCtrl.signal });
    } else if (set.provider === "deepseek") {
      text = await callDeepSeek({ apiKey:set.deepseekApiKey, model:set.deepseekModel, messages:history, signal:abortCtrl.signal });
    } else {
      text = await callOpenAI({ apiKey:set.openaiApiKey, model:set.openaiModel, messages:history, signal:abortCtrl.signal });
    }
    bubble.textContent = text || "(no content)";
    history.push({ role:"assistant", content:text });
  }catch(err){
    bubble.textContent = "❌ " + (err.message || err);
  }finally{
    abortCtrl = null;
    setBusy(false);
    chatEl.scrollTop = chatEl.scrollHeight;
  }
}

/* ---------- Events ---------- */
sendBtn.addEventListener("click", sendMessage);
stopBtn.addEventListener("click", ()=>{ if(abortCtrl) abortCtrl.abort(); });
document.addEventListener("keydown", (e)=>{
  if (e.key === "Escape" && abortCtrl) abortCtrl.abort();
});
inputEl.addEventListener("keydown", (e)=>{
  if (e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});

/* initial */
getSettings().then(()=> autosize());
