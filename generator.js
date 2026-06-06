// Multilingual Content Generator Module
window.GeneratorModule = (() => {
  // Vocabulary mapping for Demo Mode translations
  const langVocab = {
    English: {
      title: "Generated Content",
      intro: "Here is your generated content on the topic: ",
      formatLabel: "Format: ",
      toneLabel: "Tone: ",
      bestRegards: "Best regards,",
      author: "AI Content Architect",
      tags: "Hashtags: ",
      keyTakeaways: "Key Takeaways:"
    },
    Spanish: {
      title: "Contenido Generado",
      intro: "Aquí está su contenido generado sobre el tema: ",
      formatLabel: "Formato: ",
      toneLabel: "Tono: ",
      bestRegards: "Atentamente,",
      author: "Arquitecto de Contenido IA",
      tags: "Etiquetas: ",
      keyTakeaways: "Puntos Clave:"
    },
    Hindi: {
      title: "उत्पन्न सामग्री",
      intro: "यहाँ दिए गए विषय पर आपकी सामग्री है: ",
      formatLabel: "प्रारूप: ",
      toneLabel: "शैली: ",
      bestRegards: "सादर धन्यवाद,",
      author: "एआई सामग्री निर्माता",
      tags: "हैशटैग: ",
      keyTakeaways: "मुख्य बिंदु:"
    },
    German: {
      title: "Generierter Inhalt",
      intro: "Hier ist Ihr generierter Inhalt zum Thema: ",
      formatLabel: "Format: ",
      toneLabel: "Tonfall: ",
      bestRegards: "Mit freundlichen Grüßen,",
      author: "KI-Content-Architekt",
      tags: "Hashtags: ",
      keyTakeaways: "Wichtige Erkenntnisse:"
    },
    French: {
      title: "Contenu Généré",
      intro: "Voici votre contenu généré sur le thème: ",
      formatLabel: "Format: ",
      toneLabel: "Ton: ",
      bestRegards: "Cordialement,",
      author: "Architecte de Contenu IA",
      tags: "Mots-clés: ",
      keyTakeaways: "Points Clés:"
    },
    Japanese: {
      title: "生成されたコンテンツ",
      intro: "指定されたテーマに関するコンテンツはこちらです：",
      formatLabel: "フォーマット：",
      toneLabel: "トーン：",
      bestRegards: "宜しくお願い致します。",
      author: "AIコンテンツアーキテクト",
      tags: "ハッシュタグ：",
      keyTakeaways: "主な要点："
    },
    Chinese: {
      title: "生成的內容",
      intro: "以下是關於該主題的生成內容：",
      formatLabel: "格式：",
      toneLabel: "語氣：",
      bestRegards: "祝好，",
      author: "AI內容架構師",
      tags: "標籤：",
      keyTakeaways: "關鍵要點："
    }
  };

  // Pre-translated template bodies for popular subjects/samples in Demo Mode
  const bodies = {
    blog: {
      English: "In today's fast-paced tech landscape, understanding new frameworks is crucial. Focusing on practical workshops provides hands-on capability, which bridges theoretical concepts with production execution.\n\nDeveloping this application demonstrates the immense power of integrating multiple microservices. When we harness AI capabilities, we unlock a massive potential for efficiency, scalability, and user satisfaction.",
      Spanish: "En el acelerado panorama tecnológico actual, comprender los nuevos marcos de trabajo es crucial. Centrarse en talleres prácticos proporciona una capacidad real, conectando conceptos teóricos con la ejecución de producción.\n\nEl desarrollo de esta aplicación demuestra el inmenso poder de integrar múltiples microservicios. Al aprovechar la IA, desbloqueamos un enorme potencial de eficiencia y escalabilidad.",
      Hindi: "आज के तेजी से बदलते तकनीकी परिदृश्य में, नए फ्रेमवर्क को समझना महत्वपूर्ण है। व्यावहारिक कार्यशालाओं पर ध्यान केंद्रित करने से व्यावहारिक क्षमता मिलती है, जो सैद्धांतिक अवधारणाओं को उत्पादन निष्पादन से जोड़ती है।\n\nइस एप्लिकेशन को विकसित करना कई सूक्ष्म सेवाओं को एकीकृत करने की असीम शक्ति को प्रदर्शित करता है। जब हम एआई क्षमताओं का लाभ उठाते हैं, तो हम दक्षता और स्केलेबिलिटी की विशाल क्षमता को अनलॉक करते हैं।",
      German: "In der heutigen schnelllebigen Technologielandschaft ist das Verständnis neuer Frameworks von entscheidender Bedeutung. Der Fokus auf praktische Workshops bietet direkte Handlungskompetenz und verbindet theoretische Konzepte mit der Produktion.\n\nDie Entwicklung dieser Anwendung demonstriert die enorme Leistungsfähigkeit der Integration mehrerer Mikrodienste. Wenn wir KI-Funktionen nutzen, erschließen wir ein massives Potenzial für Effizienz.",
      French: "Dans le paysage technologique actuel en évolution rapide, il est crucial de comprendre les nouveaux frameworks. Se concentrer sur des ateliers pratiques offre des compétences concrètes, reliant les concepts théoriques à la production.\n\nLe développement de cette application démontre le pouvoir immense de l'intégration de microservices. En exploitant l'IA, nous libérons un potentiel d'efficacité.",
      Japanese: "今日の急速に進歩する技術環境において、新しいフレームワークを理解することは極めて重要です。実践的なワークショップに焦点を当てることで、理論的コンセプトと本番実行が結びつき、実務能力が向上します。\n\nこのアプリケーションの開発は、複数のマイクロサービスを統合することの計り知れない力を証明しています。AI機能を活用することで、効率性と拡張性の巨大な可能性が解き放たれます。",
      Chinese: "在當今快速發展的技术領域中，理解新框架至關重要。注重實踐工作坊能帶來動手能力，將理論概念與生產環境的執行相結合。\n\n開發此應用程序展示了整合多個微服務的巨大力量。當我們利用人工智慧（AI）能力時，我們就釋放了效率和擴展性的巨大潛力。"
    },
    email: {
      English: "Dear Team,\n\nI hope this message finds you well. I wanted to share some details regarding our current development sprint. We are successfully implementing new modules and aligning features ahead of schedule.\n\nPlease review the attached specifications and let me know if you have any questions or feedback.",
      Spanish: "Estimado Equipo,\n\nEspero que se encuentren muy bien. Quería compartir algunos detalles sobre nuestro sprint de desarrollo actual. Estamos implementando con éxito nuevos módulos y alineando funciones antes de lo previsto.\n\nPor favor, revisen las especificaciones adjuntas y avísenme si tienen preguntas.",
      Hindi: "प्रिय टीम,\n\nआशा है कि आप सब कुशल होंगे। मैं हमारे वर्तमान विकास चक्र के बारे में कुछ विवरण साझा करना चाहता था। हम समय से पहले नए मॉड्यूल को सफलतापूर्वक लागू कर रहे हैं।\n\nकृपया संलग्न विशिष्टताओं की समीक्षा करें और यदि आपके पास कोई प्रश्न है तो मुझे बताएं।",
      German: "Sehr geehrtes Team,\n\nich hoffe, es geht Ihnen gut. Ich wollte einige Details zu unserem aktuellen Entwicklungs-Sprint mitteilen. Wir implementieren erfolgreich neue Module vor dem Zeitplan.\n\nBitte überprüfen Sie die beigefügten Spezifikationen und teilen Sie mir Ihre Fragen mit.",
      French: "Chère Équipe,\n\nJ'espère que vous allez bien. Je voulais partager quelques détails concernant notre sprint de développement actuel. Nous implémentons avec succès de nouveaux modules en avance sur le planning.\n\nVeuillez examiner les spécifications jointes et me faire part de vos commentaires.",
      Japanese: "チームの皆様、\n\nお疲れ様です。現在の開発スプリントに関する詳細を共有いたします。新しいモジュールは順調に実装され、予定より前倒しで機能調整が進んでいます。\n\n添付の仕様書をご確認いただき、ご質問やフィードバックがあればお知らせください。",
      Chinese: "各位團隊成員：\n\n希望大家都好。我想分享關於我們當前開發衝刺的一些細節。我們已成功實施新模組，並提前完成功能對齊。\n\n請審查隨附的規格說明，如有任何問題或反饋，請告訴我。"
    },
    social: {
      English: "Super excited to announce the launch of our new dashboard! 🚀 Built with custom glassmorphism styling and seamless UI routing. Making development easier every single day! #Build #AI #DeveloperTools",
      Spanish: "¡Súper emocionado de anunciar el lanzamiento de nuestro nuevo tablero! 🚀 Construido con estilo de glassmorfismo personalizado y enrutamiento de interfaz de usuario sin interrupciones. ¡Haciendo el desarrollo más fácil cada día! #Desarrollo #IA",
      Hindi: "हमारे नए डैशबोर्ड के लॉन्च की घोषणा करते हुए बेहद उत्साहित हूँ! 🚀 कस्टम ग्लासमोर्फिज्म स्टाइल और निर्बाध यूआई रूटिंग के साथ निर्मित। विकास को हर दिन आसान बना रहे हैं! #तकनीक #एआई",
      German: "Wir freuen uns riesig, den Launch unseres neuen Dashboards bekannt zu geben! 🚀 Entwickelt mit individuellem Glassmorphismus-Design und nahtlosem UI-Routing. Erleichtert die Entwicklung jeden Tag! #Technologie #KI",
      French: "Très ravi d'annoncer le lancement de notre nouveau tableau de bord ! 🚀 Conçu avec un style glassmorphism personnalisé et un routage d'interface utilisateur fluide. Simplifier le développement au quotidien ! #Dev #IA",
      Japanese: "新しいダッシュボードのリリースを発表でき、大変嬉しく思います！ 🚀 カスタムグラスモーフィズムデザインとシームレスなUIルーティングで構築。開発が毎日さらに快適になります！ #プログラミング #人工知能",
      Chinese: "非常高興宣佈我們新儀表板的正式發佈！ 🚀 採用客製化磨砂玻璃（glassmorphism）設計與流暢的 UI 路由。讓開發工作每天都變得更輕鬆！ #科技 #人工智慧"
    },
    bullets: {
      English: "*   Prioritize core performance configurations.\n*   Enable robust responsive styling components.\n*   Enforce structured client side feedback mechanisms.\n*   Leverage cloud native tools to streamline pipeline delivery.",
      Spanish: "*   Priorizar las configuraciones de rendimiento clave.\n*   Habilitar componentes de diseño adaptables y robustos.\n*   Forzar mecanismos de retroalimentación estructurados del lado del cliente.\n*   Aprovechar herramientas nativas de la nube.",
      Hindi: "*   मुख्य प्रदर्शन कॉन्फ़िगरेशन को प्राथमिकता दें।\n*   मजबूत उत्तरदायी स्टाइलिंग घटकों को सक्षम करें।\n*   क्लाइंट साइड फीडबैक तंत्र को लागू करें।\n*   पाइपलाइन वितरण को सुव्यवस्थित करने के लिए क्लाउड टूल्स का लाभ उठाएं।",
      German: "*   Priorisieren Sie wichtige Leistungskonfigurationen.\n*   Aktivieren Sie robuste, responsive Design-Komponenten.\n*   Nutzen Sie Cloud-native Tools zur Optimierung der Pipeline.",
      French: "*   Prioriser les configurations clés de performance.\n*   Activer des composants de conception adaptatifs et robustes.\n*   Exploiter les outils cloud-native pour optimiser les processus.",
      Japanese: "*   主要なパフォーマンス設定を最優先する。\n*   堅牢でレスポンシブなスタイリングコンポーネントを有効にする。\n*   クライアント側のフィードバックメカニズムを強制する。\n*   パイプライン配信を合理化するためにクラウドネイティブツールを活用する。",
      Chinese: "*   優先考慮核心效能配置。\n*   啟用強健的響應式樣式組件。\n*   強化結構化的用戶端反饋機制。\n*   利用雲端原生工具簡化工作流交付。"
    }
  };

  function generateLocalContent(promptText, format, tone, language) {
    const vocab = langVocab[language] || langVocab.English;
    const bodyTemplates = bodies[format] || bodies.blog;
    const body = bodyTemplates[language] || bodyTemplates.English;

    // Use clean topic title
    const topic = promptText ? promptText.trim() : "AI Integration in Workshops";

    let md = `## 📝 ${vocab.title}\n\n`;
    md += `*   **${vocab.formatLabel}** ${format.toUpperCase()}\n`;
    md += `*   **${vocab.toneLabel}** ${tone.toUpperCase()}\n\n`;
    md += `*${vocab.intro} "${topic}"*\n\n`;
    md += `---\n\n`;

    if (format === "email") {
      md += `${body}\n\n`;
      md += `${vocab.bestRegards}\n`;
      md += `**${vocab.author}**`;
    } else if (format === "social") {
      // Append topic as hashtag
      const hashTopic = topic.replace(/\s+/g, "");
      md += `"${body}"\n\n`;
      md += `**${vocab.tags}** #${hashTopic} #WorkshopAI`;
    } else if (format === "bullets") {
      md += `### ${vocab.keyTakeaways}\n`;
      md += `${body}`;
    } else {
      // Blog / Article
      md += `### ${topic}\n\n`;
      md += `${body}\n\n`;
      md += `*Generated automatically in ${language} under ${tone} tone guidelines.*`;
    }

    return md;
  }

  return {
    generateLocalContent,
    languages: Object.keys(langVocab)
  };
})();
