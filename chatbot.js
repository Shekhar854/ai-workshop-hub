// FAQ Chatbot Module
window.ChatbotModule = (() => {
  const defaultFAQs = [
    {
      question: "What is Microsoft Foundry?",
      answer: "Microsoft Foundry is a hands-on, project-based engineering program where students and developers work together on real-world projects. It emphasizes software engineering best practices, modern product designs, and collaborative teamwork."
    },
    {
      question: "What are we building today?",
      answer: "Today we are building a premium **AI Workshop Hub** that integrates three essential AI applications:\n\n1. **FAQ Chatbot**: Resolves workshop-related questions using predefined FAQ banks or real-time AI.\n2. **AI Document Summarizer**: Processes pasted text or uploaded files (.txt, .md) to create custom-tailored summaries.\n3. **Multilingual Content Generator**: Generates high-quality creative text across multiple formats, tones, and target languages."
    },
    {
      question: "How can I use Gemini API?",
      answer: "To enable the Gemini API:\n1. Click the **API Settings** button in the sidebar or header.\n2. Choose **Live AI Mode**.\n3. Enter your **Gemini API Key** (available for free from Google AI Studio).\n4. Click **Save Changes**. Once configured, all modules will query Gemini in real-time!"
    },
    {
      question: "Can I deploy this app?",
      answer: "Absolutely! Because this project is built using vanilla HTML, CSS, and client-side JavaScript, it requires no server-side build steps. You can host it immediately on platforms like **GitHub Pages**, **Vercel**, **Netlify**, or **Azure Static Web Apps**."
    },
    {
      question: "What models does Gemini offer?",
      answer: "Google Gemini offers models optimized for different use cases:\n*   **Gemini 1.5 Flash**: Fast, lightweight, and highly cost-efficient, perfect for quick chat and summarization.\n*   **Gemini 1.5 Pro**: Advanced reasoning, coding assistance, and deep context processing capabilities."
    },
    {
      question: "How does the document summarizer work?",
      answer: "The Document Summarizer takes raw text or file inputs, removes excessive noise, and formats a structured summary based on your selections (Length: Short, Medium, Long; Tone: Professional, Educational, Casual). In Live mode, it issues a structured prompt instructing the model to yield a perfect output."
    }
  ];

  // Simple fuzzy keyword match algorithm for Demo Mode
  function findBestLocalResponse(query) {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return null;

    let bestMatch = null;
    let highestScore = 0;

    for (const faq of defaultFAQs) {
      const qText = faq.question.toLowerCase();
      let score = 0;

      // Check for exact matching words
      const words = cleanQuery.split(/\s+/);
      words.forEach(word => {
        if (word.length > 2 && qText.includes(word)) {
          score += 2;
        }
      });

      // Bonus for phrase match
      if (qText.includes(cleanQuery) || cleanQuery.includes(qText)) {
        score += 10;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    // Return match if it meets a threshold, else default fallback
    return highestScore >= 2 ? bestMatch : null;
  }

  function renderSidebarFAQs(onFaqClick) {
    const listContainer = document.getElementById("sidebar-faq-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    
    defaultFAQs.slice(0, 5).forEach((faq, index) => {
      const item = document.createElement("div");
      item.className = "faq-item";
      item.textContent = faq.question;
      item.dataset.index = index;
      
      item.addEventListener("click", () => {
        if (typeof onFaqClick === "function") {
          onFaqClick(faq.question);
        }
      });
      
      listContainer.appendChild(item);
    });
  }

  // Export functions
  return {
    faqs: defaultFAQs,
    findBestLocalResponse,
    renderSidebarFAQs
  };
})();
