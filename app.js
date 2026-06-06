// Core Application Controller
document.addEventListener("DOMContentLoaded", () => {
  
  // --- STATE ---
  const state = {
    activeTab: "chatbot",
    theme: localStorage.getItem("theme") || "dark",
    apiMode: localStorage.getItem("apiMode") || "demo", // 'demo' or 'live'
    aiProvider: localStorage.getItem("aiProvider") || "gemini", // 'gemini' or 'azure'
    apiKey: localStorage.getItem("apiKey") || "",
    azureEndpoint: localStorage.getItem("azureEndpoint") || "",
    azureApiKey: localStorage.getItem("azureApiKey") || "",
    azureDeployment: localStorage.getItem("azureDeployment") || "",
    azureApiVersion: localStorage.getItem("azureApiVersion") || "2024-02-15-preview",
    accentColor: localStorage.getItem("accentColor") || "windows"
  };

  // --- TELEMETRY METRICS ---
  const metrics = {
    calls: parseInt(localStorage.getItem("m_calls") || "0"),
    latencySum: parseInt(localStorage.getItem("m_latencySum") || "0"),
    tokens: parseInt(localStorage.getItem("m_tokens") || "0")
  };

  // --- DOM ELEMENTS ---
  const tabs = document.querySelectorAll(".nav-item");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const tabTitle = document.getElementById("current-tab-title");
  
  // Theme & Status Elements
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const statusBadge = document.getElementById("status-badge");
  const statusBadgeText = document.getElementById("status-badge-text");
  
  // Settings Overlay Elements
  const settingsModal = document.getElementById("settings-modal-overlay");
  const settingsTriggerBtn = document.getElementById("settings-trigger-btn");
  const headerSettingsBtn = document.getElementById("header-settings-btn");
  const settingsCloseBtn = document.getElementById("settings-close-btn");
  const settingsCancelBtn = document.getElementById("settings-cancel-btn");
  const settingsSaveBtn = document.getElementById("settings-save-btn");
  
  const radioDemo = document.getElementById("radio-mode-demo");
  const radioLive = document.getElementById("radio-mode-live");
  
  // Service Provider Select
  const aiProviderSelect = document.getElementById("ai-provider");
  const liveConfigContainer = document.getElementById("live-config-container");
  
  // Panel Configurations
  const geminiInputsPanel = document.getElementById("gemini-inputs-panel");
  const azureInputsPanel = document.getElementById("azure-inputs-panel");
  
  // Input fields
  const apiKeyInput = document.getElementById("gemini-api-key");
  const azureEndpointInput = document.getElementById("azure-endpoint");
  const azureApiKeyInput = document.getElementById("azure-api-key");
  const azureDeploymentInput = document.getElementById("azure-deployment");
  const azureApiVersionInput = document.getElementById("azure-api-version");
  
  // Accent Picker Container
  const themeAccentContainer = document.getElementById("theme-accent-container");
  const modeStatusIndicator = document.getElementById("mode-status-indicator");

  // Chatbot Elements
  const chatMessagesBox = document.getElementById("chat-messages-box");
  const chatTextInput = document.getElementById("chat-text-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatMicBtn = document.getElementById("chat-mic-btn");
  const chatSuggestionChips = document.getElementById("chat-suggestion-chips");

  // Summarizer Elements
  const dragZone = document.getElementById("summarizer-drag-zone");
  const fileInput = document.getElementById("summarizer-file-input");
  const rawTextInput = document.getElementById("summarizer-text-input");
  const wordCountBadge = document.getElementById("word-count-badge");
  const summaryLength = document.getElementById("summary-length");
  const summaryTone = document.getElementById("summary-tone");
  const summarizerRunBtn = document.getElementById("summarizer-run-btn");
  const summaryPlaceholder = document.getElementById("summary-placeholder");
  const summaryResultContent = document.getElementById("summary-result-content");
  const summaryCopyBtn = document.getElementById("summary-copy-btn");
  const summaryDownloadBtn = document.getElementById("summary-download-btn");

  // Generator Elements
  const generatorPrompt = document.getElementById("generator-prompt-input");
  const generatorFormat = document.getElementById("generator-format");
  const generatorTone = document.getElementById("generator-tone");
  const generatorLanguage = document.getElementById("generator-language");
  const generatorRunBtn = document.getElementById("generator-run-btn");
  const generatorPlaceholder = document.getElementById("generator-placeholder");
  const generatorResultContent = document.getElementById("generator-result-content");
  const generatorCopyBtn = document.getElementById("generator-copy-btn");
  const generatorDownloadBtn = document.getElementById("generator-download-btn");

  // Telemetry Monitor DOM Elements
  const monitorProvider = document.getElementById("monitor-provider");
  const monitorCalls = document.getElementById("monitor-calls");
  const monitorLatency = document.getElementById("monitor-latency");
  const monitorTokens = document.getElementById("monitor-tokens");
  const monitorSaving = document.getElementById("monitor-saving");

  // Toast Container
  const toastContainer = document.getElementById("toast-notification-container");

  // --- ACCENT THEMES ---
  const accentColors = {
    windows: {
      dark: { primary: "#60cdff", secondary: "#0078d4" },
      light: { primary: "#0078d4", secondary: "#005a9e" }
    },
    teams: {
      dark: { primary: "#a6b1e1", secondary: "#6264a7" },
      light: { primary: "#6264a7", secondary: "#4f4b87" }
    },
    xbox: {
      dark: { primary: "#10b981", secondary: "#107c10" },
      light: { primary: "#107c10", secondary: "#0b580b" }
    },
    office: {
      dark: { primary: "#ffb900", secondary: "#d83b01" },
      light: { primary: "#d83b01", secondary: "#a82e00" }
    }
  };

  function applyAccent(accent, theme) {
    const colors = accentColors[accent]?.[theme] || accentColors.windows[theme];
    document.documentElement.style.setProperty("--primary", colors.primary);
    document.documentElement.style.setProperty("--primary-glow", colors.primary + "26"); // ~15% opacity hex extension
    document.documentElement.style.setProperty("--secondary", colors.secondary);
    document.documentElement.style.setProperty("--secondary-glow", colors.secondary + "26");
    
    // Highlight active picker in UI
    const buttons = document.querySelectorAll(".accent-picker-btn");
    buttons.forEach(btn => {
      if (btn.dataset.accent === accent) {
        btn.style.borderWidth = "2px";
        btn.style.borderColor = "var(--text-primary)";
      } else {
        btn.style.borderWidth = "1px";
        btn.style.borderColor = "var(--border-color)";
      }
    });
  }

  // --- TELEMETRY LOGGER ---
  function updateTelemetry(latencyMs, promptLength, responseLength) {
    metrics.calls += 1;
    metrics.latencySum += Math.round(latencyMs);
    
    // Simple tokens calculation: ~4 characters per token
    const approxTokens = Math.round((promptLength + responseLength) / 4);
    metrics.tokens += approxTokens;

    localStorage.setItem("m_calls", metrics.calls.toString());
    localStorage.setItem("m_latencySum", metrics.latencySum.toString());
    localStorage.setItem("m_tokens", metrics.tokens.toString());

    updateMonitorUI();
  }

  function updateMonitorUI() {
    if (!monitorProvider) return;

    if (state.apiMode === "demo") {
      monitorProvider.textContent = "Demo Mode";
      monitorProvider.style.color = "var(--text-secondary)";
    } else {
      const name = state.aiProvider === "azure" ? "Azure OpenAI" : "Google Gemini";
      monitorProvider.textContent = name;
      monitorProvider.style.color = "var(--primary)";
    }

    monitorCalls.textContent = metrics.calls;
    
    const avgLatency = metrics.calls > 0 ? Math.round(metrics.latencySum / metrics.calls) : 0;
    monitorLatency.textContent = `${avgLatency} ms`;
    
    monitorTokens.textContent = metrics.tokens;

    // Estimate Cloud Advisor savings (simulated Azure OpenAI optimization advice: e.g. $0.0015 per 1k tokens)
    const costSaved = (metrics.tokens * 0.000015).toFixed(4);
    monitorSaving.textContent = `$${costSaved}`;
  }

  // --- INITIALIZE APPLICATION ---
  function init() {
    // 1. Theme & Accent Configuration
    document.documentElement.setAttribute("data-theme", state.theme);
    updateThemeIcon();
    applyAccent(state.accentColor, state.theme);

    // 2. Settings Configuration
    radioDemo.checked = state.apiMode === "demo";
    radioLive.checked = state.apiMode === "live";
    aiProviderSelect.value = state.aiProvider;
    
    apiKeyInput.value = state.apiKey;
    azureEndpointInput.value = state.azureEndpoint;
    azureApiKeyInput.value = state.azureApiKey;
    azureDeploymentInput.value = state.azureDeployment;
    azureApiVersionInput.value = state.azureApiVersion;
    
    updateSettingsModalFields();
    updateStatusBadge();
    updateMonitorUI();

    // 3. Render Chatbot Pre-configured FAQs
    if (window.ChatbotModule) {
      ChatbotModule.renderSidebarFAQs((faqQuestion) => {
        chatTextInput.value = faqQuestion;
        sendChatMessage(faqQuestion);
      });
    }

    // 4. Summarizer File Upload Configuration
    if (window.SummarizerModule) {
      window.SummarizerModule.initDragAndDrop(dragZone, fileInput, (extractedText, filename) => {
        rawTextInput.value = extractedText;
        updateWordCount();
        showToast("success", `Loaded file: ${filename}`);
      });
    }

    // 5. Speak welcome message button binding
    const welcomeBubble = document.querySelector(".message.assistant");
    if (welcomeBubble) {
      appendSpeakerIcon(welcomeBubble, "Welcome to the Microsoft Foundry Workshop! I am your AI FAQ Assistant. Feel free to pick a suggested topic below or type your own question.");
    }

    // Bind event listeners
    bindEvents();
  }

  // --- EVENT BINDING ---
  function bindEvents() {
    // Sidebar navigation tabs
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const tabId = tab.dataset.tab;
        switchTab(tabId);
      });
    });

    // Theme Toggle
    themeToggleBtn.addEventListener("click", toggleTheme);

    // Settings Toggle / Open / Close
    [settingsTriggerBtn, headerSettingsBtn].forEach(btn => {
      btn.addEventListener("click", openSettings);
    });
    [settingsCloseBtn, settingsCancelBtn, settingsModal].forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target === el || el !== settingsModal) {
          closeSettings();
        }
      });
    });
    
    // Prevent closing when clicking inside settings modal container
    document.querySelector(".settings-modal").addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Settings inputs
    radioDemo.addEventListener("change", updateSettingsModalFields);
    radioLive.addEventListener("change", updateSettingsModalFields);
    aiProviderSelect.addEventListener("change", updateSettingsModalFields);
    settingsSaveBtn.addEventListener("click", saveSettings);

    // Accent picker actions
    themeAccentContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".accent-picker-btn");
      if (btn) {
        const selectedAccent = btn.dataset.accent;
        state.accentColor = selectedAccent;
        localStorage.setItem("accentColor", selectedAccent);
        applyAccent(selectedAccent, state.theme);
        showToast("success", `Applied ${selectedAccent} color scheme`);
      }
    });

    // FAQ Chatbot: Input Actions
    chatSendBtn.addEventListener("click", () => {
      const query = chatTextInput.value.trim();
      if (query) sendChatMessage(query);
    });
    chatTextInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = chatTextInput.value.trim();
        if (query) sendChatMessage(query);
      }
    });

    // Voice Input Speech-to-Text Setup
    setupSpeechToText();

    // Suggestion chips
    if (chatSuggestionChips) {
      chatSuggestionChips.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (btn) {
          const query = btn.dataset.query;
          chatTextInput.value = query;
          sendChatMessage(query);
        }
      });
    }

    // Summarizer: Inputs
    rawTextInput.addEventListener("input", updateWordCount);
    summarizerRunBtn.addEventListener("click", handleSummarize);
    summaryCopyBtn.addEventListener("click", () => {
      copyToClipboard(summaryResultContent.innerText, "Summary copied to clipboard");
    });
    summaryDownloadBtn.addEventListener("click", () => {
      downloadAsFile(summaryResultContent.innerText, "summary.md");
    });

    // Generator: Inputs
    generatorRunBtn.addEventListener("click", handleGenerateContent);
    generatorCopyBtn.addEventListener("click", () => {
      copyToClipboard(generatorResultContent.innerText, "Generated content copied");
    });
    generatorDownloadBtn.addEventListener("click", () => {
      downloadAsFile(generatorResultContent.innerText, "generated_content.md");
    });
  }

  // --- NAVIGATION & VIEWS ---
  function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Update tabs classes
    tabs.forEach(tab => {
      if (tab.dataset.tab === tabId) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    // Update viewport panes
    tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add("active");
      } else {
        pane.classList.remove("active");
      }
    });

    // Update Header Text
    let label = "FAQ Chatbot";
    if (tabId === "summarizer") label = "AI Document Summarizer";
    if (tabId === "generator") label = "Multilingual Content Generator";
    tabTitle.textContent = label;
  }

  // --- THEME ---
  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("theme", state.theme);
    updateThemeIcon();
    applyAccent(state.accentColor, state.theme);
    showToast("success", `Switched to ${state.theme} mode`);
  }

  function updateThemeIcon() {
    const icon = themeToggleBtn.querySelector("svg");
    if (state.theme === "light") {
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
    } else {
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m2.828-11.314l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />`;
    }
  }

  // --- SETTINGS MODAL ---
  function openSettings() {
    settingsModal.style.display = "flex";
    
    // Load state
    radioDemo.checked = state.apiMode === "demo";
    radioLive.checked = state.apiMode === "live";
    aiProviderSelect.value = state.aiProvider;
    
    apiKeyInput.value = state.apiKey;
    azureEndpointInput.value = state.azureEndpoint;
    azureApiKeyInput.value = state.azureApiKey;
    azureDeploymentInput.value = state.azureDeployment;
    azureApiVersionInput.value = state.azureApiVersion;
    
    updateSettingsModalFields();
  }

  function closeSettings() {
    settingsModal.style.display = "none";
  }

  function updateSettingsModalFields() {
    const isLive = radioLive.checked;
    const provider = aiProviderSelect.value;
    
    if (isLive) {
      liveConfigContainer.style.display = "flex";
      modeStatusIndicator.textContent = "Live AI Mode active";
      modeStatusIndicator.style.color = "var(--primary)";
      
      // Conditional inputs based on provider select
      if (provider === "gemini") {
        geminiInputsPanel.style.display = "block";
        azureInputsPanel.style.display = "none";
      } else {
        geminiInputsPanel.style.display = "none";
        azureInputsPanel.style.display = "flex";
      }
    } else {
      liveConfigContainer.style.display = "none";
      modeStatusIndicator.textContent = "Demo Mode active";
      modeStatusIndicator.style.color = "var(--text-muted)";
    }
  }

  function saveSettings() {
    const selectedMode = radioDemo.checked ? "demo" : "live";
    const selectedProvider = aiProviderSelect.value;
    
    const enteredGeminiKey = apiKeyInput.value.trim();
    const enteredAzureEndpoint = azureEndpointInput.value.trim();
    const enteredAzureApiKey = azureApiKeyInput.value.trim();
    const enteredAzureDeployment = azureDeploymentInput.value.trim();
    const enteredAzureVersion = azureApiVersionInput.value.trim();

    // Verification
    if (selectedMode === "live") {
      if (selectedProvider === "gemini" && !enteredGeminiKey) {
        showToast("error", "Gemini API Key is required for Gemini Live AI!");
        return;
      }
      if (selectedProvider === "azure" && (!enteredAzureEndpoint || !enteredAzureApiKey || !enteredAzureDeployment)) {
        showToast("error", "Azure Endpoint, API Key, and Deployment Name are required for Azure Live AI!");
        return;
      }
    }

    state.apiMode = selectedMode;
    state.aiProvider = selectedProvider;
    state.apiKey = enteredGeminiKey;
    state.azureEndpoint = enteredAzureEndpoint;
    state.azureApiKey = enteredAzureApiKey;
    state.azureDeployment = enteredAzureDeployment;
    state.azureApiVersion = enteredAzureVersion;

    // Save in storage
    localStorage.setItem("apiMode", state.apiMode);
    localStorage.setItem("aiProvider", state.aiProvider);
    localStorage.setItem("apiKey", state.apiKey);
    localStorage.setItem("azureEndpoint", state.azureEndpoint);
    localStorage.setItem("azureApiKey", state.azureApiKey);
    localStorage.setItem("azureDeployment", state.azureDeployment);
    localStorage.setItem("azureApiVersion", state.azureApiVersion);

    updateStatusBadge();
    closeSettings();
    updateMonitorUI();
    
    const providerName = state.aiProvider === "azure" ? "Azure OpenAI" : "Google Gemini";
    showToast("success", `Configuration saved! Mode: ${state.apiMode === 'live' ? `Live AI (${providerName})` : 'Demo'}`);
  }

  function updateStatusBadge() {
    if (state.apiMode === "live") {
      statusBadge.className = "badge-mode";
      const name = state.aiProvider === "azure" ? "Azure AI" : "Gemini AI";
      statusBadgeText.textContent = `Live (${name})`;
    } else {
      statusBadge.className = "badge-mode demo";
      statusBadgeText.textContent = "Demo Mode";
    }
  }

  // --- SPEECH RECOGNITION (STT) ---
  function setupSpeechToText() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      chatMicBtn.style.display = "none";
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    let isListening = false;

    chatMicBtn.addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
      } else {
        chatMicBtn.style.color = "var(--primary)";
        chatMicBtn.style.borderColor = "var(--primary)";
        chatMicBtn.innerHTML = `
          <div class="typing-dots" style="height:10px; gap:2px; justify-content:center;">
            <span style="width:4px; height:4px; background:var(--primary); margin:0;"></span>
            <span style="width:4px; height:4px; background:var(--primary); margin:0;"></span>
            <span style="width:4px; height:4px; background:var(--primary); margin:0;"></span>
          </div>
        `;
        recognition.start();
      }
    });

    recognition.onstart = () => { isListening = true; };
    recognition.onend = () => {
      isListening = false;
      chatMicBtn.style.color = "var(--text-secondary)";
      chatMicBtn.style.borderColor = "var(--border-color)";
      chatMicBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:18px;height:18px;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      `;
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      chatTextInput.value = transcript;
      showToast("success", "Voice query captured!");
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition Error:", e.error);
      showToast("error", "Speech capturing failed: " + e.error);
    };
  }

  // --- SPEECH SYNTHESIS (TTS) ---
  let activeUtterance = null;
  function speakText(text) {
    const cleanText = text.replace(/[\*\#\-\`\_]/g, ""); // Strip markdown characters
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // If we clicked the speaker button again to stop the same text, return
      if (activeUtterance && activeUtterance.text === cleanText) {
        activeUtterance = null;
        return;
      }
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const cleanVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
    if (cleanVoice) {
      utterance.voice = cleanVoice;
    }
    utterance.rate = 1.05;

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function appendSpeakerIcon(messageElement, rawText) {
    const bubble = messageElement.querySelector(".msg-bubble");
    if (!bubble) return;

    // Create a speech trigger button
    const speakerBtn = document.createElement("button");
    speakerBtn.className = "icon-btn";
    speakerBtn.title = "Read aloud";
    speakerBtn.style.cssText = `
      position: absolute;
      top: 6px;
      right: -32px;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      background: var(--bg-card);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease, color 0.15s ease;
    `;
    speakerBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:12px;height:12px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    `;

    // Make button visible on message hover
    messageElement.style.position = "relative";
    messageElement.addEventListener("mouseenter", () => { speakerBtn.style.opacity = "1"; });
    messageElement.addEventListener("mouseleave", () => { speakerBtn.style.opacity = "0"; });

    speakerBtn.addEventListener("click", () => {
      speakText(rawText);
    });

    messageElement.appendChild(speakerBtn);
  }

  // --- UNIFIED AI CALL ROUTER ---
  async function callAI(promptText) {
    if (state.apiMode === "demo") {
      throw new Error("Cannot query backend in Demo Mode.");
    }
    
    if (state.aiProvider === "azure") {
      return await callAzureOpenAI(promptText);
    } else {
      return await callGeminiAPI(promptText);
    }
  }

  // --- GOOGLE GEMINI API CONNECTOR ---
  async function callGeminiAPI(promptText) {
    if (!state.apiKey) {
      throw new Error("Gemini API Key missing! Open API Settings to configure.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${response.status} Error`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error("Empty response from Google Gemini.");
      }

      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  // --- AZURE OPENAI API CONNECTOR ---
  async function callAzureOpenAI(promptText) {
    if (!state.azureEndpoint || !state.azureApiKey || !state.azureDeployment) {
      throw new Error("Azure OpenAI credentials (Endpoint, API Key, Deployment) missing! Check API Settings.");
    }

    let baseEndpoint = state.azureEndpoint.trim();
    if (baseEndpoint.endsWith("/")) {
      baseEndpoint = baseEndpoint.slice(0, -1);
    }

    const version = state.azureApiVersion || "2024-02-15-preview";
    const url = `${baseEndpoint}/openai/deployments/${state.azureDeployment}/chat/completions?api-version=${version}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": state.azureApiKey
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptText }],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${response.status} Error`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error("Empty response from Azure OpenAI.");
      }

      return text;
    } catch (error) {
      console.error("Azure OpenAI Error:", error);
      throw error;
    }
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(type, message) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let svgIcon = "";
    if (type === "success") {
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
    } else {
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
    }

    toast.innerHTML = `
      ${svgIcon}
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = "fadeIn 0.3s ease reverse forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  // --- MARKDOWN FORMATTER ---
  function formatMarkdown(text) {
    if (!text) return "";
    
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="bold-text">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic-text">$1</em>');

    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');

    html = html.replace(/^\s*[\*\-\+]\s+(.*?)$/gm, '<li>$1</li>');

    const lines = html.split("\n");
    let inList = false;
    let resultLines = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("<li>") || trimmed.includes("<li>")) {
        if (!inList) {
          resultLines.push("<ul>");
          inList = true;
        }
        resultLines.push(line);
      } else {
        if (inList) {
          resultLines.push("</ul>");
          inList = false;
        }
        if (trimmed.length > 0 && !trimmed.startsWith("<h") && !trimmed.startsWith("<ul>") && !trimmed.startsWith("</ul>") && !trimmed.startsWith("<li>")) {
          resultLines.push(`<p>${line}</p>`);
        } else {
          resultLines.push(line);
        }
      }
    });

    if (inList) {
      resultLines.push("</ul>");
    }

    return resultLines.join("\n");
  }

  // --- CHATBOT RUNNER ---
  async function sendChatMessage(query) {
    if (!query) return;
    
    const startTime = performance.now();
    appendMessage("user", query);
    chatTextInput.value = "";
    
    const typingBubble = appendTypingIndicator();
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;

    try {
      let reply = "";
      if (state.apiMode === "demo") {
        await new Promise(resolve => setTimeout(resolve, 800));
        const match = ChatbotModule.findBestLocalResponse(query);
        if (match) {
          reply = match.answer;
        } else {
          reply = `I'm currently running in **Demo Mode**. I couldn't find an exact match for your question in our pre-configured FAQs.\n\n*   To ask any custom questions in real-time, click **API Settings** and switch to **Live AI Mode** using your Gemini or Azure OpenAI credentials!\n*   Otherwise, try asking something else or clicking one of the popular FAQs on the right.`;
        }
      } else {
        const customPrompt = `
          You are the Microsoft Foundry Workshop FAQ Assistant. Answer the user's question concisely based on the following pre-configured FAQs if possible:
          ${JSON.stringify(ChatbotModule.faqs)}
          
          If the question is unrelated to the pre-configured FAQs, answer it directly and professionally anyway as an AI Assistant, keeping context relative to software engineering, AI, or the workshop.
          
          User question: "${query}"
          Answer:
        `;
        reply = await callAI(customPrompt);
      }

      const latency = performance.now() - startTime;
      typingBubble.remove();
      
      const messageEl = appendMessage("assistant", reply);
      appendSpeakerIcon(messageEl, reply);
      
      chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;

      // Update telemetry monitor stats
      updateTelemetry(latency, query.length, reply.length);
      
    } catch (err) {
      typingBubble.remove();
      appendMessage("assistant", `❌ **Error querying assistant**: ${err.message}`);
      chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
      showToast("error", err.message);
    }
  }

  function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    const formatted = formatMarkdown(text);
    
    msg.innerHTML = `
      <div class="chat-avatar">${sender === "user" ? "ME" : "AI"}</div>
      <div class="msg-bubble">${formatted}</div>
    `;
    chatMessagesBox.appendChild(msg);
    return msg;
  }

  function appendTypingIndicator() {
    const msg = document.createElement("div");
    msg.className = "message assistant typing-indicator";
    msg.innerHTML = `
      <div class="chat-avatar">AI</div>
      <div class="msg-bubble">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    chatMessagesBox.appendChild(msg);
    return msg;
  }

  // --- SUMMARIZER RUNNER ---
  function updateWordCount() {
    const count = SummarizerModule.countWords(rawTextInput.value);
    wordCountBadge.textContent = count;
  }

  async function handleSummarize() {
    const text = rawTextInput.value.trim();
    if (!text) {
      showToast("error", "Please write or load some text content first!");
      return;
    }

    const length = summaryLength.value;
    const tone = summaryTone.value;
    const startTime = performance.now();

    summaryPlaceholder.style.display = "none";
    summaryResultContent.style.display = "block";
    summaryResultContent.innerHTML = `<div class="typing-dots" style="justify-content:center; padding: 40px 0;"><span></span><span></span><span></span></div>`;

    try {
      let result = "";
      if (state.apiMode === "demo") {
        await new Promise(r => setTimeout(r, 1200));
        result = SummarizerModule.generateLocalSummary(text, length, tone);
      } else {
        const prompt = `
          Summarize the following text.
          Target summary length: ${length === 'short' ? 'Brief list of bullet points' : length === 'medium' ? 'Detailed multi-point summary' : 'Executive formal summary'}.
          Focus Tone: ${tone}.
          Output the summary directly in clean Markdown.
          Text to summarize:
          "${text}"
        `;
        result = await callAI(prompt);
      }

      const latency = performance.now() - startTime;
      summaryResultContent.innerHTML = formatMarkdown(result);
      showToast("success", "Summary generated successfully!");

      updateTelemetry(latency, text.length, result.length);

    } catch (err) {
      summaryResultContent.innerHTML = `<p style="color:var(--danger)">❌ Error generating summary: ${err.message}</p>`;
      showToast("error", err.message);
    }
  }

  // --- MULTILINGUAL GENERATOR RUNNER ---
  async function handleGenerateContent() {
    const promptText = generatorPrompt.value.trim();
    if (!promptText) {
      showToast("error", "Please write a topic or details to generate content on!");
      return;
    }

    const format = generatorFormat.value;
    const tone = generatorTone.value;
    const language = generatorLanguage.value;
    const startTime = performance.now();

    generatorPlaceholder.style.display = "none";
    generatorResultContent.style.display = "block";
    generatorResultContent.innerHTML = `<div class="typing-dots" style="justify-content:center; padding: 40px 0;"><span></span><span></span><span></span></div>`;

    try {
      let result = "";
      if (state.apiMode === "demo") {
        await new Promise(r => setTimeout(r, 1200));
        result = GeneratorModule.generateLocalContent(promptText, format, tone, language);
      } else {
        const prompt = `
          Generate content based on the following:
          Topic/Instructions: "${promptText}"
          Format: ${format}
          Tone: ${tone}
          Target Language: ${language}
          
          Generate the content directly in the target language (${language}) using clean Markdown.
          Make sure it sounds natural, authentic, and perfectly suited for ${tone} audience.
        `;
        result = await callAI(prompt);
      }

      const latency = performance.now() - startTime;
      generatorResultContent.innerHTML = formatMarkdown(result);
      showToast("success", "Content generated successfully!");

      updateTelemetry(latency, promptText.length, result.length);

    } catch (err) {
      generatorResultContent.innerHTML = `<p style="color:var(--danger)">❌ Error generating content: ${err.message}</p>`;
      showToast("error", err.message);
    }
  }

  // --- UTILITIES ---
  function copyToClipboard(text, successMsg) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast("success", successMsg);
    }).catch(err => {
      showToast("error", "Unable to copy text: " + err.message);
    });
  }

  // Download Markdown file utility
  function downloadAsFile(text, filename) {
    if (!text) return;
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("success", `Downloaded ${filename}`);
  }

  // Run initialization
  init();
});
