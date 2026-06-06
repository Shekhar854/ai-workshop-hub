// Document Summarizer Module
window.SummarizerModule = (() => {
  // Initialize drag and drop events
  function initDragAndDrop(dragZone, fileInput, onTextLoaded) {
    if (!dragZone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dragZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragZone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dragZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragZone.classList.remove('dragover');
      }, false);
    });

    dragZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleFile(files[0], onTextLoaded);
      }
    }, false);

    fileInput.addEventListener('change', (e) => {
      if (fileInput.files.length > 0) {
        handleFile(fileInput.files[0], onTextLoaded);
      }
    });
  }

  function handleFile(file, callback) {
    // Check file size (limit 1MB for workshop)
    if (file.size > 1024 * 1024) {
      alert("File size exceeds 1MB limit. Please upload a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (typeof callback === 'function') {
        callback(text, file.name);
      }
    };
    reader.readAsText(file);
  }

  function countWords(text) {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  }

  // Smart local summarization mock for Demo Mode
  function generateLocalSummary(text, length, tone) {
    if (!text || text.trim().length < 20) {
      return "Error: Please input a longer document content to summarize (at least 20 characters).";
    }

    // Split text into paragraphs and sentences
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 10);
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 8);
    
    // Fallback if formatting is single-line
    const title = paragraphs[0] ? paragraphs[0].substring(0, 80) + "..." : "Document Summary";

    let summaryMarkdown = ``;
    
    // Tone headers
    let toneHeader = "Professional Analysis";
    if (tone === "educational") toneHeader = "Key Concept Breakdown";
    if (tone === "casual") toneHeader = "Quick TL;DR (Simple Terms)";

    summaryMarkdown += `### 📄 Summary: ${toneHeader}\n\n`;

    // 1. Executive overview
    if (sentences.length > 0) {
      const mainOverview = sentences.slice(0, Math.min(2, sentences.length)).join(". ") + ".";
      summaryMarkdown += `**Overview**: ${mainOverview}\n\n`;
    }

    // 2. Length configuration
    if (length === "short") {
      summaryMarkdown += `**Key Takeaways (Bullet Points)**:\n`;
      // Extract first sentence of first 3 paragraphs
      const keyPoints = paragraphs.slice(0, 3).map(p => {
        const firstSec = p.split(/[.!?]/)[0];
        return firstSec ? firstSec.trim() : p.substring(0, 50);
      });
      keyPoints.forEach(point => {
        summaryMarkdown += `*   ${point}.\n`;
      });
    } else if (length === "medium") {
      summaryMarkdown += `**Detailed Findings**:\n`;
      // Print 2 mini paragraphs
      const midPoints = paragraphs.slice(0, Math.min(3, paragraphs.length));
      midPoints.forEach((p, idx) => {
        const shortened = p.split(/[.!?]/).slice(0, 2).join(". ") + ".";
        summaryMarkdown += `*   **Point ${idx + 1}**: ${shortened}\n`;
      });
      
      summaryMarkdown += `\n**Core Theme**: Explores advanced components, setup techniques, and practical integrations.`;
    } else {
      // Long / Executive Summary
      summaryMarkdown += `#### 🔍 Comprehensive Breakdown\n\n`;
      paragraphs.slice(0, Math.min(4, paragraphs.length)).forEach((p, idx) => {
        const sentence = p.split(/[.!?]/)[0];
        summaryMarkdown += `**Section ${idx + 1}**: *${sentence}*\n${p.substring(0, 180)}...\n\n`;
      });
      
      summaryMarkdown += `#### 💡 Recommendations & Takeaways\n`;
      summaryMarkdown += `*   Optimize configurations for modular scalability.\n`;
      summaryMarkdown += `*   Leverage client-side APIs for low latency interactions.`;
    }

    return summaryMarkdown;
  }

  // Export functions
  return {
    initDragAndDrop,
    countWords,
    generateLocalSummary
  };
})();
