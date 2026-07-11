// ==UserScript==
// @name         BerryLee AI Chat Exporter
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Exportiert Chats von ChatGPT, Claude, Gemini, Grok als saubere Markdown-Datei
// @author       BerryLee
// @match        *://chatgpt.com/*
// @match        *://claude.ai/*
// @match        *://gemini.google.com/*
// @match        *://grok.x.ai/*
// @match        *://grok.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const btn = document.createElement('button');
    btn.innerHTML = '📥 Chat als Markdown exportieren';
    btn.style.cssText = `
        position: fixed; 
        bottom: 30px; 
        right: 30px; 
        z-index: 99999; 
        padding: 12px 20px; 
        background: #10a37f; 
        color: white; 
        border: none; 
        border-radius: 8px; 
        font-size: 15px; 
        cursor: pointer; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    btn.onclick = () => {
        // Versuche, Nachrichten zu finden (funktioniert bei den meisten AI-Chats)
        const messages = document.querySelectorAll('div[data-message-author-role], .message, [class*="Message"], [role="article"]');
        let markdown = `# AI Chat Export\n\n**Datum:** ${new Date().toLocaleString('de-DE')}\n\n`;

        if (messages.length > 0) {
            messages.forEach((msg, index) => {
                const role = msg.getAttribute('data-message-author-role') || (msg.className.includes('user') ? 'User' : 'Assistant');
                const text = msg.innerText.trim();
                if (text.length > 5) {  // Ignoriere sehr kurze Elemente
                    markdown += `### ${role} (${index + 1})\n\n${text}\n\n---\n\n`;
                }
            });
        } else {
            // Fallback: gesamten sichtbaren Text
            markdown += document.body.innerText.replace(/\n{3,}/g, '\n\n');
        }

        // Datei herunterladen
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().slice(0,10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('✅ Chat wurde als Markdown-Datei heruntergeladen!');
    };

    document.body.appendChild(btn);
})();
