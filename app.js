// Core Application Controller
document.addEventListener("DOMContentLoaded", () => {
  
  // --- STATE ---
  const state = {
    activeTab: "chatbot",
    theme: localStorage.getItem("theme") || "dark",
    apiMode: localStorage.getItem("apiMode") || "demo", // 'demo' or 'live'
    apiKey: localStorage.getItem("apiKey") || ""
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
  const apiKeyInput = document.getElementById("gemini-api-key");
  const apiKeyGroup = document.getElementById("apikey-input-group");
  const modeStatusIndicator = document.getElementById("mode-status-indicator");

  // Chatbot Elements
  const chatMessagesBox = document.getElementById("chat-messages-box");
  const chatTextInput = document.getElementById("chat-text-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
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

  // Toast Container
  const toastContainer = document.getElementById("toast-notification-container");

  // --- INITIALIZE APPLICATION ---
  function init() {
    // 1. Theme Configuration
    document.documentElement.setAttribute("data-theme", state.theme);
    updateThemeIcon();

    // 2. Settings Configuration
    radioDemo.checked = state.apiMode === "demo";
    radioLive.checked = state.apiMode === "live";
    apiKeyInput.value = state.apiKey;
    updateSettingsModalFields();
    updateStatusBadge();

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
    settingsSaveBtn.addEventListener("click", saveSettings);

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
    showToast("success", `Switched to ${state.theme} mode`);
  }

  function updateThemeIcon() {
    const icon = themeToggleBtn.querySelector("svg");
    if (state.theme === "light") {
      // Moon representation
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
    } else {
      // Sun representation
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m2.828-11.314l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />`;
    }
  }

  // --- SETTINGS MODAL ---
  function openSettings() {
    settingsModal.style.display = "flex";
    apiKeyInput.value = state.apiKey;
    radioDemo.checked = state.apiMode === "demo";
    radioLive.checked = state.apiMode === "live";
    updateSettingsModalFields();
  }

  function closeSettings() {
    settingsModal.style.display = "none";
  }

  function updateSettingsModalFields() {
    const isLive = radioLive.checked;
    if (isLive) {
      apiKeyGroup.style.opacity = "1";
      apiKeyGroup.style.pointerEvents = "all";
      modeStatusIndicator.textContent = "Live AI Mode active";
      modeStatusIndicator.style.color = "var(--primary)";
    } else {
      apiKeyGroup.style.opacity = "0.5";
      apiKeyGroup.style.pointerEvents = "none";
      modeStatusIndicator.textContent = "Demo Mode active";
      modeStatusIndicator.style.color = "var(--secondary)";
    }
  }

  function saveSettings() {
    const selectedMode = radioDemo.checked ? "demo" : "live";
    const enteredKey = apiKeyInput.value.trim();

    if (selectedMode === "live" && !enteredKey) {
      showToast("error", "API Key is required to run in Live AI Mode!");
      return;
    }

    state.apiMode = selectedMode;
    state.apiKey = enteredKey;

    localStorage.setItem("apiMode", state.apiMode);
    localStorage.setItem("apiKey", state.apiKey);

    updateStatusBadge();
    closeSettings();
    showToast("success", `Configuration saved! Running in ${state.apiMode === 'live' ? 'Live AI' : 'Demo'} mode.`);
  }

  function updateStatusBadge() {
    if (state.apiMode === "live") {
      statusBadge.className = "badge-mode";
      statusBadgeText.textContent = "Live AI Mode";
    } else {
      statusBadge.className = "badge-mode demo";
      statusBadgeText.textContent = "Demo Mode";
    }
  }

  // --- GEMINI API CONNECTOR ---
  async function callGeminiAPI(promptText) {
    if (state.apiMode === "demo") {
      throw new Error("Cannot call live API in Demo mode.");
    }
    
    if (!state.apiKey) {
      throw new Error("No Gemini API Key provided. Open API Settings to configure.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText
                }
              ]
            }
          ]
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
        throw new Error("Empty response received from the Gemini service.");
      }

      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
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
    
    // Auto-remove after 4 seconds
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
    
    // Escape standard tags
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="bold-text">$1</strong>');
    
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em class="italic-text">$1</em>');

    // Headers: ###, ####
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');

    // Bullet points: * or -
    html = html.replace(/^\s*[\*\-\+]\s+(.*?)$/gm, '<li>$1</li>');

    // Process lists and paragraphs
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
    
    // Add user bubble
    appendMessage("user", query);
    chatTextInput.value = "";
    
    // Show typing dots indicator
    const typingBubble = appendTypingIndicator();
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;

    try {
      let reply = "";
      if (state.apiMode === "demo") {
        // Mock Response
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating latency
        const match = ChatbotModule.findBestLocalResponse(query);
        if (match) {
          reply = match.answer;
        } else {
          reply = `I'm currently running in **Demo Mode**. I couldn't find a exact match for your question in our pre-configured FAQs.\n\n*   To ask any custom questions in real-time, click **API Settings** and switch to **Live AI Mode** using your Gemini API key!\n*   Otherwise, try asking something else or clicking one of the popular FAQs on the right.`;
        }
      } else {
        // Live API Response
        const customPrompt = `
          You are the Microsoft Foundry Workshop FAQ Assistant. Answer the user's question concisely based on the following pre-configured FAQs if possible:
          ${JSON.stringify(ChatbotModule.faqs)}
          
          If the question is unrelated to the pre-configured FAQs, answer it directly and professionally anyway as an AI Assistant, keeping context relative to software engineering, AI, or the workshop.
          
          User question: "${query}"
          Answer:
        `;
        reply = await callGeminiAPI(customPrompt);
      }

      // Remove typing bubble
      typingBubble.remove();
      
      // Add response bubble
      appendMessage("assistant", reply);
      chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
      
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

    // Loading State UI toggle
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
        result = await callGeminiAPI(prompt);
      }

      summaryResultContent.innerHTML = formatMarkdown(result);
      showToast("success", "Summary generated successfully!");

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
        result = await callGeminiAPI(prompt);
      }

      generatorResultContent.innerHTML = formatMarkdown(result);
      showToast("success", "Content generated successfully!");

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
