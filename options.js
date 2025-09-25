const els = {
  provider: document.getElementById("provider"),
  openaiKey: document.getElementById("openaiKey"),
  openaiModel: document.getElementById("openaiModel"),
  geminiKey: document.getElementById("geminiKey"),
  geminiModel: document.getElementById("geminiModel"),
  openrouterKey: document.getElementById("openrouterKey"),
  openrouterModel: document.getElementById("openrouterModel"),
  groqKey: document.getElementById("groqKey"),
  groqModel: document.getElementById("groqModel"),
  deepseekKey: document.getElementById("deepseekKey"),
  deepseekModel: document.getElementById("deepseekModel"),
  save: document.getElementById("save"),
  clear: document.getElementById("clear")
};

function load(){
  chrome.storage.sync.get({
    provider:"openai",
    openaiApiKey:"", openaiModel:"gpt-5",
    geminiApiKey:"", geminiModel:"gemini-1.5-flash",
    openrouterApiKey:"", openrouterModel:"openrouter/auto",
    groqApiKey:"", groqModel:"llama-3.1-8b-instant",
    deepseekApiKey:"", deepseekModel:"deepseek-chat"
  }, d=>{
    els.provider.value = d.provider;
    els.openaiKey.value = d.openaiApiKey;
    els.openaiModel.value = d.openaiModel;
    els.geminiKey.value = d.geminiApiKey;
    els.geminiModel.value = d.geminiModel;
    els.openrouterKey.value = d.openrouterApiKey;
    els.openrouterModel.value = d.openrouterModel;
    els.groqKey.value = d.groqApiKey;
    els.groqModel.value = d.groqModel;
    els.deepseekKey.value = d.deepseekApiKey;
    els.deepseekModel.value = d.deepseekModel;
  });
}

els.save.addEventListener("click", ()=>{
  chrome.storage.sync.set({
    provider: els.provider.value,
    openaiApiKey: els.openaiKey.value.trim(),
    openaiModel: els.openaiModel.value.trim(),
    geminiApiKey: els.geminiKey.value.trim(),
    geminiModel: els.geminiModel.value.trim(),
    openrouterApiKey: els.openrouterKey.value.trim(),
    openrouterModel: els.openrouterModel.value.trim(),
    groqApiKey: els.groqKey.value.trim(),
    groqModel: els.groqModel.value.trim(),
    deepseekApiKey: els.deepseekKey.value.trim(),
    deepseekModel: els.deepseekModel.value.trim()
  }, ()=>{
    els.save.textContent = "Saved ✓";
    setTimeout(()=> els.save.textContent = "Save", 900);
  });
});

els.clear.addEventListener("click", ()=>{
  chrome.storage.sync.clear(()=> load());
});

load();
